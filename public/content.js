// Content script for Access Sentinel extension
if (typeof ContentManager === 'undefined') {
  class ContentManager {
    constructor() {
      this.setupMessageListeners();
    }

    setupMessageListeners() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        switch (request.action) {
          case 'scanPage':
            this.handleScanPage(sendResponse);
            return true;
          case 'displayScanResults':
            this.displayScanResults(request.results);
            sendResponse({ success: true });
            break;
          case 'showImageAnalysisLoading':
            this.showImageAnalysisLoading(request.imageUrl);
            sendResponse({ success: true });
            break;
          case 'displayImageAnalysis':
            this.displayImageAnalysis(request.result);
            sendResponse({ success: true });
            break;
          case 'showFactCheckLoading':
            this.showFactCheckLoading();
            sendResponse({ success: true });
            break;
          case 'displayFactCheckResult':
            this.displayFactCheckResult(request.result);
            sendResponse({ success: true });
            break;
        }
      });
    }

    async handleScanPage(sendResponse) {
      try {
        const result = await this.scanPageForImages();
        sendResponse(result);
      } catch (error) {
        console.error('Scan error:', error);
        sendResponse({ error: error.message });
      }
    }

    async scanPageForImages() {
      try {
        const textContent = document.body.innerText || document.body.textContent || '';
        const currentUrl = window.location.href;
        
        console.log('Scanning page:', currentUrl);
        console.log('Text content length:', textContent.length);
        
        if (!textContent || textContent.trim().length === 0) {
          throw new Error('No content found on page');
        }
        
        const images = document.querySelectorAll('img');
        const imageData = [];
        
        for (let img of Array.from(images).slice(0, 10)) {
          if (img.src && img.src.startsWith('http')) {
            imageData.push(img.src);
          }
        }

        return new Promise((resolve) => {
          chrome.runtime.sendMessage({
            action: 'processPageScan',
            data: {
              url: currentUrl,
              textContent: textContent.substring(0, 5000),
              images: imageData
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Message error:', chrome.runtime.lastError);
              resolve({ error: 'Connection failed: ' + chrome.runtime.lastError.message });
            } else if (response && response.error) {
              console.error('Response error:', response.error);
              resolve(response);
            } else {
              resolve(response || { success: true });
            }
          });
        });
      } catch (error) {
        console.error('Scan error:', error);
        return { error: 'Scan failed: ' + error.message };
      }
    }
    displayScanResults(results) {
      this.removeExistingOverlay();

      // Apply blur/block actions based on policy
      if (results && results.policyActions) {
        this.applyContentFiltering(results.policyActions);
      }

      const overlay = this.createOverlay();
      const header = this.createHeader('🛡️ Page Scan Results');
      const content = document.createElement('div');
      content.style.cssText = `padding: 15px;`;

      if (results && results.loading) {
        content.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <div style="width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            <p style="margin-top: 10px; color: #666;">${results.message || 'Loading...'}</p>
            <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}</style>
          </div>
        `;
        overlay.appendChild(header);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        return;
      }

      if (results && results.error) {
        content.innerHTML = `<p style="color: #f44336; margin: 0;">❌ Error: ${results.error}</p>`;
        overlay.appendChild(header);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        this.autoRemoveOverlay(overlay);
        return;
      }

      if (results && results.result && results.details) {
        const scoreColor = results.result.includes('High Risk') || results.result === 'Misinformation' ? '#f44336' : 
                          results.result.includes('Medium Risk') || results.result === 'Uncertain' ? '#ff9800' : '#4caf50';

        content.innerHTML = `
          <div style="margin-bottom: 15px;">
            <div style="font-weight: bold; color: ${scoreColor}; font-size: 16px;">${results.result}</div>
            <div style="font-size: 12px; color: #666; margin-top: 5px; line-height: 1.4;">${results.details.justification}</div>
          </div>
          <div style="font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 8px;">
            <div>Tokens: ${results.details.inputTokens} input, ${results.details.outputTokens} output</div>
            <div>Cost: $${results.cost.toFixed(4)}</div>
          </div>
        `;
        overlay.appendChild(header);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        this.autoRemoveOverlay(overlay);
        return;
      }

      if (results && results.scores) {
        const categories = {
          fake_info: 'Fake Info', violence: 'Violence', drugs: 'Drugs',
          guns: 'Guns', ai_generated: 'AI Generated', nudity: 'Nudity'
        };
        
        let html = `<div style="margin-bottom: 10px; font-weight: bold;">Overall Score: ${results.overall_score || 0}/100</div>`;
        
        if (results.policyName) {
          html += `<div style="margin-bottom: 10px; padding: 8px; background: #e3f2fd; border-radius: 4px; font-size: 12px;">
            <strong>Policy:</strong> ${results.policyName}
          </div>`;
        }
        
        for (const [key, value] of Object.entries(results.scores)) {
          const categoryName = categories[key] || key;
          const score = value || 0;
          const action = results.policyActions && results.policyActions[key] ? results.policyActions[key] : 'allow';
          
          const actionBadge = action === 'block' ? '🚫 BLOCKED' : 
                             action === 'blur' ? '👁️ BLURRED' : 
                             '✅ ALLOWED';
          const actionColor = action === 'block' ? '#f44336' : 
                             action === 'blur' ? '#ff9800' : 
                             '#4caf50';
          
          html += `<div style="margin-bottom: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
              <div style="font-weight: bold; color: #333; text-transform: capitalize;">${categoryName}</div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="font-size: 14px; font-weight: bold; color: ${this.getScoreColor(score)};">${score}/100</div>
                <div style="font-size: 10px; padding: 2px 6px; border-radius: 3px; background: ${actionColor}; color: white; font-weight: bold;">${actionBadge}</div>
              </div>
            </div>
            <div style="width: 100%; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
              <div style="width: ${score}%; height: 100%; background: ${this.getScoreColor(score)}; transition: width 0.3s ease;"></div>
            </div>
          </div>`;
        }
        content.innerHTML = html;
      } else if (Array.isArray(results) && results.length > 0) {
        content.innerHTML = `<p style="color: #f44336; margin: 0;">❌ ${results[0].category}: ${results[0].message}</p>`;
      } else {
        content.innerHTML = '<p style="color: #4CAF50; margin: 0;">✅ No issues detected on this page</p>';
      }

      overlay.appendChild(header);
      overlay.appendChild(content);
      document.body.appendChild(overlay);
      this.autoRemoveOverlay(overlay);
    }

    applyContentFiltering(policyActions) {
      // Apply blur to images and sensitive content
      const blurCategories = Object.entries(policyActions)
        .filter(([_, action]) => action === 'blur')
        .map(([category, _]) => category);

      if (blurCategories.length > 0) {
        this.blurSensitiveContent(blurCategories);
      }
    }

    blurSensitiveContent(categories) {
      // Blur all images on the page
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.dataset.contentGuardProcessed) {
          img.dataset.contentGuardProcessed = 'true';
          
          // Create wrapper for blur effect
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `position: relative; display: inline-block; width: ${img.width || img.offsetWidth}px; height: ${img.height || img.offsetHeight}px;`;
          
          // Clone image with blur
          const blurredImg = img.cloneNode(true);
          blurredImg.style.cssText = `filter: blur(20px); width: 100%; height: 100%; object-fit: cover;`;
          blurredImg.dataset.blurred = 'true';
          
          // Create show button
          const showButton = document.createElement('button');
          showButton.textContent = '👁️ Show Content';
          showButton.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: bold; font-size: 14px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.3);`;
          
          showButton.onclick = () => {
            blurredImg.style.filter = 'none';
            showButton.remove();
          };
          
          // Replace original image
          img.parentNode.insertBefore(wrapper, img);
          wrapper.appendChild(blurredImg);
          wrapper.appendChild(showButton);
          img.remove();
        }
      });

      // Blur video elements
      const videos = document.querySelectorAll('video');
      videos.forEach((video) => {
        if (!video.dataset.contentGuardProcessed) {
          video.dataset.contentGuardProcessed = 'true';
          
          const wrapper = document.createElement('div');
          wrapper.style.cssText = `position: relative; display: inline-block; width: ${video.width || video.offsetWidth}px; height: ${video.height || video.offsetHeight}px;`;
          
          video.style.filter = 'blur(20px)';
          
          const showButton = document.createElement('button');
          showButton.textContent = '👁️ Show Content';
          showButton.style.cssText = `position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
            padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; 
            cursor: pointer; font-weight: bold; font-size: 14px; z-index: 1000; box-shadow: 0 2px 8px rgba(0,0,0,0.3);`;
          
          showButton.onclick = () => {
            video.style.filter = 'none';
            showButton.remove();
          };
          
          video.parentNode.insertBefore(wrapper, video);
          wrapper.appendChild(video);
          wrapper.appendChild(showButton);
        }
      });
    }



    getScoreColor(score) {
      if (score < 30) return '#4CAF50';
      if (score < 70) return '#FF9800';
      return '#F44336';
    }

    createOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'access-sentinel-overlay';
      overlay.style.cssText = `position: fixed; top: 20px; right: 20px; width: 320px; max-height: 500px; background: white; border: 2px solid #667eea; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; overflow-y: auto;`;
      return overlay;
    }



    createHeader(title) {
      const header = document.createElement('div');
      header.style.cssText = `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; font-weight: bold; display: flex; justify-content: space-between; align-items: center; border-radius: 10px 10px 0 0;`;
      header.innerHTML = `<span>${title}</span><span style="cursor: pointer; font-size: 20px; padding: 2px 6px; border-radius: 50%;" onclick="this.parentElement.parentElement.remove()">×</span>`;
      return header;
    }

    removeExistingOverlay() {
      const existingOverlay = document.getElementById('access-sentinel-overlay');
      if (existingOverlay) existingOverlay.remove();
    }

    autoRemoveOverlay(overlay) {
      setTimeout(() => {
        if (overlay.parentElement) overlay.remove();
      }, 15000);
    }
  }

  window.contentManager = new ContentManager();
}
