// Content script for Hive Visual Censor extension

let extensionEnabled = true;
let processedElements = new WeakSet();

// Initialize the content script
initialize();

async function initialize() {
  // Check if extension is enabled
  const result = await chrome.storage.local.get(['extensionEnabled']);
  extensionEnabled = result.extensionEnabled !== false;
  
  if (extensionEnabled) {
    startContentScanning();
  }
}

function startContentScanning() {
  // Scan existing images and videos
  scanExistingMedia();
  
  // Set up observers for new content
  setupMutationObserver();
  setupIntersectionObserver();
}

function scanExistingMedia() {
  // Scan images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!processedElements.has(img) && isElementVisible(img)) {
      processMediaElement(img, 'image');
    }
  });
  
  // Scan videos
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
    if (!processedElements.has(video) && isElementVisible(video)) {
      processMediaElement(video, 'video');
    }
  });
  
  // Scan background images
  scanBackgroundImages();
}

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    if (!extensionEnabled) return;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node itself is media
          if (node.tagName === 'IMG' && !processedElements.has(node)) {
            processMediaElement(node, 'image');
          } else if (node.tagName === 'VIDEO' && !processedElements.has(node)) {
            processMediaElement(node, 'video');
          }
          
          // Check for media elements within the node
          const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
          const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
          
          images.forEach(img => {
            if (!processedElements.has(img)) {
              processMediaElement(img, 'image');
            }
          });
          
          videos.forEach(video => {
            if (!processedElements.has(video)) {
              processMediaElement(video, 'video');
            }
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    if (!extensionEnabled) return;
    
    entries.forEach((entry) => {
      if (entry.isIntersecting && !processedElements.has(entry.target)) {
        const element = entry.target;
        if (element.tagName === 'IMG') {
          processMediaElement(element, 'image');
        } else if (element.tagName === 'VIDEO') {
          processMediaElement(element, 'video');
        }
      }
    });
  });
  
  // Observe all images and videos
  document.querySelectorAll('img, video').forEach(element => {
    observer.observe(element);
  });
}

async function processMediaElement(element, mediaType) {
  if (processedElements.has(element)) return;
  
  processedElements.add(element);
  
  try {
    let mediaData;
    
    if (mediaType === 'image') {
      mediaData = {
        mediaUrl: element.src,
        mediaType: 'image',
        contextUrl: window.location.href
      };
    } else if (mediaType === 'video') {
      // For videos, capture a frame
      const frameData = await captureVideoFrame(element);
      mediaData = {
        dataUri: frameData,
        mediaType: 'video',
        contextUrl: window.location.href
      };
    }
    
    // Send to background script for moderation
    const response = await chrome.runtime.sendMessage({
      type: 'MODERATE_CONTENT',
      ...mediaData
    });
    
    // Apply the moderation decision
    applyModerationDecision(element, response);
    
  } catch (error) {
    console.error('Error processing media element:', error);
  }
}

function captureVideoFrame(video) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (max 512px for efficiency)
    const maxSize = 512;
    const aspectRatio = video.videoWidth / video.videoHeight;
    
    if (video.videoWidth > video.videoHeight) {
      canvas.width = Math.min(maxSize, video.videoWidth);
      canvas.height = canvas.width / aspectRatio;
    } else {
      canvas.height = Math.min(maxSize, video.videoHeight);
      canvas.width = canvas.height * aspectRatio;
    }
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to data URI
    const dataUri = canvas.toDataURL('image/jpeg', 0.8);
    resolve(dataUri);
  });
}

function applyModerationDecision(element, decision) {
  if (decision.decision === 'BLOCK') {
    blockElement(element);
  } else if (decision.decision === 'BLUR') {
    blurElement(element);
  }
  // ALLOW - do nothing
}

function blockElement(element) {
  // Create blocked content overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  overlay.innerHTML = `
    <div style="text-align: center; color: #6b7280;">
      <div style="font-size: 48px; margin-bottom: 8px;">🛡️</div>
      <div style="font-weight: 600; margin-bottom: 4px;">Content Blocked</div>
      <div style="font-size: 12px;">Filtered by Hive Visual Censor</div>
    </div>
  `;
  
  // Make parent relative if not already positioned
  const parent = element.parentElement;
  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === 'static') {
    parent.style.position = 'relative';
  }
  
  // Hide original element and add overlay
  element.style.visibility = 'hidden';
  parent.appendChild(overlay);
}

function blurElement(element) {
  // Apply blur effect
  element.style.filter = 'blur(20px)';
  element.style.transition = 'filter 0.3s ease';
  
  // Create reveal button
  const revealBtn = document.createElement('button');
  revealBtn.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    z-index: 1001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  revealBtn.textContent = 'Click to reveal';
  
  // Make parent relative if not already positioned
  const parent = element.parentElement;
  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === 'static') {
    parent.style.position = 'relative';
  }
  
  parent.appendChild(revealBtn);
  
  // Handle reveal click
  revealBtn.addEventListener('click', () => {
    element.style.filter = 'none';
    revealBtn.remove();
  });
}

function scanBackgroundImages() {
  const elementsWithBg = document.querySelectorAll('*');
  elementsWithBg.forEach(element => {
    const style = window.getComputedStyle(element);
    const bgImage = style.backgroundImage;
    
    if (bgImage && bgImage !== 'none' && !processedElements.has(element)) {
      const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        processBackgroundImage(element, urlMatch[1]);
      }
    }
  });
}

async function processBackgroundImage(element, imageUrl) {
  if (processedElements.has(element)) return;
  
  processedElements.add(element);
  
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'MODERATE_CONTENT',
      mediaUrl: imageUrl,
      mediaType: 'background-image',
      contextUrl: window.location.href
    });
    
    if (response.decision === 'BLOCK') {
      element.style.backgroundImage = 'none';
      element.style.backgroundColor = '#f3f4f6';
    } else if (response.decision === 'BLUR') {
      element.style.filter = 'blur(20px)';
    }
  } catch (error) {
    console.error('Error processing background image:', error);
  }
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTENSION_TOGGLED') {
    extensionEnabled = request.enabled;
    
    if (extensionEnabled) {
      startContentScanning();
    } else {
      // Remove all overlays and restore original elements
      document.querySelectorAll('[data-hive-overlay]').forEach(overlay => {
        overlay.remove();
      });
      
      document.querySelectorAll('[style*="blur"]').forEach(element => {
        element.style.filter = 'none';
      });
    }
  }
});