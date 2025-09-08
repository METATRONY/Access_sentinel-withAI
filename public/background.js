// Background service worker for Hive Visual Censor extension

const SUPABASE_URL = 'https://qzrcbuzvgcyahevtsfms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cmNidXp2Z2N5YWhldnRzZm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzgzNjAsImV4cCI6MjA3MjU1NDM2MH0.eeHYAJGJeYYqFZgFJGJhKgGgGgGgGgGgGgGgGgGgGgG';

// Cache for moderation results to avoid duplicate API calls
const moderationCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const rateLimiter = new Map();
const MAX_REQUESTS_PER_MINUTE = 60;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'MODERATE_CONTENT') {
    handleContentModeration(request, sender, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.type === 'TOGGLE_EXTENSION') {
    handleToggleExtension(request.enabled);
  }
  
  if (request.type === 'UPDATE_STATS') {
    updateStats(request.stats);
  }
});

async function handleContentModeration(request, sender, sendResponse) {
  try {
    // Get user token
    const result = await chrome.storage.local.get(['userToken', 'extensionEnabled']);
    const token = result.userToken;
    const enabled = result.extensionEnabled !== false; // Default to enabled
    
    if (!enabled) {
      sendResponse({ decision: 'ALLOW', reason: 'Extension disabled' });
      return;
    }
    
    if (!token) {
      sendResponse({ decision: 'ALLOW', reason: 'Not authenticated' });
      return;
    }
    
    // Check rate limit
    const tabId = sender.tab?.id;
    if (tabId && isRateLimited(tabId)) {
      sendResponse({ decision: 'ALLOW', reason: 'Rate limited' });
      return;
    }
    
    // Check cache first
    const cacheKey = generateCacheKey(request.mediaUrl || request.dataUri);
    const cached = moderationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      sendResponse(cached.result);
      return;
    }
    
    // Call Supabase Edge Function
    const moderationResult = await callModerationAPI(token, request);
    
    // Cache the result
    moderationCache.set(cacheKey, {
      result: moderationResult,
      timestamp: Date.now()
    });
    
    // Update stats
    await updateModerationStats(moderationResult.decision);
    
    sendResponse(moderationResult);
    
  } catch (error) {
    console.error('Content moderation error:', error);
    sendResponse({ 
      decision: 'ALLOW', 
      reason: 'Error: ' + error.message 
    });
  }
}

async function callModerationAPI(token, request) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/moderate-content`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      mediaUrl: request.mediaUrl,
      dataUri: request.dataUri,
      mediaType: request.mediaType,
      contextUrl: request.contextUrl
    })
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return await response.json();
}

function generateCacheKey(mediaIdentifier) {
  // Create a simple hash of the media identifier
  let hash = 0;
  for (let i = 0; i < mediaIdentifier.length; i++) {
    const char = mediaIdentifier.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

function isRateLimited(tabId) {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  if (!rateLimiter.has(tabId)) {
    rateLimiter.set(tabId, []);
  }
  
  const requests = rateLimiter.get(tabId);
  
  // Remove old requests outside the window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimiter.set(tabId, recentRequests);
  
  // Check if we're over the limit
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }
  
  // Add current request
  recentRequests.push(now);
  return false;
}

async function updateModerationStats(decision) {
  const result = await chrome.storage.local.get(['stats']);
  const stats = result.stats || { scanned: 0, blocked: 0, blurred: 0 };
  
  stats.scanned++;
  
  if (decision === 'BLOCK') {
    stats.blocked++;
  } else if (decision === 'BLUR') {
    stats.blurred++;
  }
  
  await chrome.storage.local.set({ stats });
}

function handleToggleExtension(enabled) {
  // Notify all content scripts about the toggle
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'EXTENSION_TOGGLED',
        enabled: enabled
      }).catch(() => {
        // Ignore errors for tabs that don't have content script
      });
    });
  });
}

async function updateStats(newStats) {
  await chrome.storage.local.set({ stats: newStats });
}

// Clean up cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of moderationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      moderationCache.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Clean up rate limiter periodically
setInterval(() => {
  const now = Date.now();
  const windowStart = now - 60000;
  
  for (const [tabId, requests] of rateLimiter.entries()) {
    const recentRequests = requests.filter(timestamp => timestamp > windowStart);
    if (recentRequests.length === 0) {
      rateLimiter.delete(tabId);
    } else {
      rateLimiter.set(tabId, recentRequests);
    }
  }
}, 60000); // Clean up every minute