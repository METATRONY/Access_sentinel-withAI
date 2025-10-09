// Background script for Access Sentinel extension
class ExtensionManager {
  constructor() {
    this.isEnabled = false;
    this.activePolicy = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadActivePolicy();
    this.setupContextMenus();
    this.setupMessageHandlers();
    this.setupStorageListener();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['isEnabled']);
      this.isEnabled = result.isEnabled || false;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async loadActivePolicy() {
    try {
      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id) {
        return;
      }

      // Fetch active policy from policy-manager edge function
      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/policy-manager', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          action: 'getActive',
          userId: user.user.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.policy) {
          this.activePolicy = result.policy;
          await chrome.storage.local.set({ activePolicy: result.policy });
          console.log('Active policy loaded:', result.policy.name);
        }
      }
    } catch (error) {
      console.error('Error loading active policy:', error);
    }
  }

  applyPolicyToResults(scanResults) {
    if (!this.activePolicy || !this.activePolicy.thresholds) {
      return { ...scanResults, policyActions: {} };
    }

    const policyActions = {};
    const blockedCategories = [];
    const thresholds = this.activePolicy.thresholds;

    if (scanResults.scores) {
      for (const [category, score] of Object.entries(scanResults.scores)) {
        if (thresholds[category]) {
          const categoryThresholds = thresholds[category];
          
          // Determine action based on score ranges
          if (score >= categoryThresholds.high_threshold) {
            policyActions[category] = categoryThresholds.high_action;
          } else if (score >= categoryThresholds.medium_threshold) {
            policyActions[category] = categoryThresholds.medium_action;
          } else {
            policyActions[category] = categoryThresholds.low_action;
          }

          // Track blocked categories
          if (policyActions[category] === 'block') {
            blockedCategories.push(category);
          }
        }
      }
    }

    return { 
      ...scanResults, 
      policyActions, 
      policyName: this.activePolicy.name,
      blockedCategories,
      shouldBlock: blockedCategories.length > 0
    };
  }

  async checkAndBlockPage(tabId, url) {
    try {
      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id || !this.activePolicy) {
        return;
      }

      // Get page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => document.body.innerText || document.body.textContent || ''
      });

      if (!results || !results[0] || !results[0].result) {
        return;
      }

      const content = results[0].result;
      
      // Quick scan
      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/page-scanner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          url: url,
          content: content.substring(0, 5000),
          userId: user.user.id,
          policyId: this.activePolicy.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        const resultsWithPolicy = this.applyPolicyToResults(result);

        if (resultsWithPolicy.shouldBlock) {
          // Redirect to blocked page
          const blockedUrl = chrome.runtime.getURL('blocked.html') + 
            `?url=${encodeURIComponent(url)}&categories=${resultsWithPolicy.blockedCategories.join(',')}`;
          chrome.tabs.update(tabId, { url: blockedUrl });
        }
      }
    } catch (error) {
      console.error('Error checking page:', error);
    }
  }




  setupContextMenus() {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'analyzeImage',
        title: '🔍 Analyze with Gemini AI',
        contexts: ['image']
      });
      chrome.contextMenus.create({
        id: 'factCheckText',
        title: '✅ Fact Check with Gemini',
        contexts: ['selection']
      });
    });
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'toggleExtension':
          this.handleToggleExtension(request.enabled);
          sendResponse({ success: true });
          break;
        case 'refreshPolicy':
          this.loadActivePolicy()
            .then(() => sendResponse({ success: true, policy: this.activePolicy }))
            .catch(error => sendResponse({ error: error.message }));
          return true;
        case 'scanPageFromPopup':
          this.handleScanFromPopup()
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
          return true;
        case 'processPageScan':
          this.handleProcessPageScan(request.data, sender.tab)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
          return true;
      }
    });

    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'analyzeImage') {
        this.analyzeContextImage(info.srcUrl, tab);
      } else if (info.menuItemId === 'factCheckText') {
        this.factCheckContextText(info.selectionText, tab);
      }
    });
  }


  setupStorageListener() {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.isEnabled) {
        this.notifyContentScripts('toggleExtension', {
          enabled: changes.isEnabled.newValue
        });
      }
    });
  }

  async handleToggleExtension(enabled) {
    this.isEnabled = enabled;
    await chrome.storage.local.set({ isEnabled: enabled });
    chrome.action.setBadgeText({ text: enabled ? 'ON' : 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: enabled ? '#4CAF50' : '#F44336' });
  }

  async handleScanFromPopup() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id) {
        throw new Error('Please login first');
      }

      // Inject content script if needed
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
      } catch (e) {
        // Content script might already be injected
      }

      // Get page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            url: window.location.href,
            textContent: document.body.innerText || document.body.textContent || '',
            title: document.title
          };
        }
      });

      if (!results || !results[0] || !results[0].result) {
        throw new Error('Failed to extract page content');
      }

      const pageData = results[0].result;
      
      if (!pageData.textContent || pageData.textContent.trim().length === 0) {
        throw new Error('No content found on page');
      }

      // Call API
      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/page-scanner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          url: pageData.url,
          content: pageData.textContent.substring(0, 5000),
          userId: user.user.id,
          policyId: null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Apply policy rules to results
      const resultsWithPolicy = this.applyPolicyToResults(result);

      // Display results in content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: resultsWithPolicy
      });
      
      return { success: true, results: resultsWithPolicy };
    } catch (error) {
      console.error('Error in handleScanFromPopup:', error);
      return { error: error.message };
    }
  }


  async handleProcessPageScan(data, tab) {
    try {
      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id) {
        throw new Error('Please login first');
      }

      if (!data.url || !data.textContent) {
        throw new Error('URL and content are required');
      }

      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/page-scanner', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          url: data.url,
          content: data.textContent,
          userId: user.user.id,
          policyId: data.policyId || null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Apply policy rules to results
      const resultsWithPolicy = this.applyPolicyToResults(result);

      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: resultsWithPolicy
      });
      
      return { success: true, results: resultsWithPolicy };

    } catch (error) {
      console.error('Error processing page scan:', error);
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: [{ category: 'Error', score: 0, message: error.message }]
      });
      return { error: error.message };
    }
  }

  async notifyContentScripts(action, data) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action, ...data }).catch(() => {
            // Ignore errors for tabs without content script
          });
        }
      }
    } catch (error) {
      console.error('Error notifying content scripts:', error);
    }
  }

  async analyzeContextImage(imageUrl, tab) {
    try {
      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'displayScanResults',
          results: { error: 'Please login first' }
        });
        return;
      }

      // Show loading state
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: { loading: true, message: 'Analyzing image...' }
      });

      // Call AI analysis API
      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/ai-content-check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          userId: user.user.id,
          type: 'image'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: result
      });

      await this.saveToHistory({
        type: 'image',
        url: imageUrl,
        result: result,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error analyzing image:', error);
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: { error: error.message }
      });
    }
  }

  async factCheckContextText(text, tab) {
    try {
      const user = await chrome.storage.local.get(['user']);
      if (!user.user || !user.user.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'displayScanResults',
          results: { error: 'Please login first' }
        });
        return;
      }

      // Show loading state
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: { loading: true, message: 'Fact checking...' }
      });

      // Call fact check API
      const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/ai-content-check', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.user.access_token || ''}`
        },
        body: JSON.stringify({
          text: text,
          userId: user.user.id,
          type: 'text'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: result
      });

      await this.saveToHistory({
        type: 'text',
        content: text,
        result: result,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error fact checking text:', error);
      chrome.tabs.sendMessage(tab.id, {
        action: 'displayScanResults',
        results: { error: error.message }
      });
    }
  }

  async saveToHistory(analysisResult) {
    try {
      const result = await chrome.storage.local.get(['analysisHistory']);
      const history = result.analysisHistory || [];
      history.unshift(analysisResult);
      if (history.length > 1000) history.splice(1000);
      await chrome.storage.local.set({ analysisHistory: history });
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }
}

// Initialize the extension manager
new ExtensionManager();
