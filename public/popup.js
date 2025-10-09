// Popup functionality for Access Sentinel extension
let isScanning = false;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
  const authContainer = document.getElementById('authContainer');
  const mainContainer = document.getElementById('mainContainer');
  const userInfo = document.getElementById('userInfo');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const scanBtn = document.getElementById('scanBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const enableToggle = document.getElementById('enableToggle');
  const status = document.getElementById('status');
  const scanResults = document.getElementById('scanResults');

  const authTabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  chrome.storage.local.get(['userId', 'userEmail'], function(result) {
    if (result.userId && result.userEmail) {
      currentUser = { id: result.userId, email: result.userEmail };
      showMainInterface();
    } else {
      showAuthInterface();
    }
  });

  authTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabType = this.getAttribute('data-tab');
      authTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      if (tabType === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
      }
    });
  });

  if (loginBtn) {
    loginBtn.addEventListener('click', async function() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      loginBtn.textContent = 'Logging in...';
      loginBtn.disabled = true;
      try {
        const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/auth-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success && data.user) {
          await chrome.storage.local.set({
            userId: data.user.id,
            userEmail: data.user.email,
            accessToken: data.session?.access_token,
            user: data.user
          });
          currentUser = { id: data.user.id, email: data.user.email };
          showMainInterface();
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        alert('Login failed. Please try again.');
      } finally {
        loginBtn.textContent = 'Login';
        loginBtn.disabled = false;
      }
    });
  }

  if (signupBtn) {
    signupBtn.addEventListener('click', async function() {
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      if (!email || !password) {
        alert('Please fill in all fields');
        return;
      }
      signupBtn.textContent = 'Signing up...';
      signupBtn.disabled = true;
      try {
        const response = await fetch('https://qzrcbuzvgcyahevtsfms.supabase.co/functions/v1/auth-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
          alert('Account created! Please login.');
          document.querySelector('[data-tab="login"]').click();
        } else {
          alert(data.error || 'Signup failed');
        }
      } catch (error) {
        alert('Signup failed. Please try again.');
      } finally {
        signupBtn.textContent = 'Sign Up';
        signupBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      await chrome.storage.local.clear();
      currentUser = null;
      showAuthInterface();
    });
  }

  if (scanBtn) {
    scanBtn.addEventListener('click', async function() {
      if (!currentUser) {
        alert('Please login first');
        return;
      }
      isScanning = true;
      scanBtn.textContent = 'Scanning...';
      scanBtn.disabled = true;
      status.textContent = 'Scanning page...';
      try {
        chrome.runtime.sendMessage({ action: 'scanPageFromPopup' }, (response) => {
          if (chrome.runtime.lastError) {
            status.textContent = 'Error: ' + chrome.runtime.lastError.message;
            alert('Error: ' + chrome.runtime.lastError.message);
          } else if (response && response.error) {
            status.textContent = 'Scan failed: ' + response.error;
            alert('Scan failed: ' + response.error);
          } else if (response && response.success) {
            status.textContent = 'Scan completed successfully';
            if (response.results) {
              displayResults(response.results);
            }
          } else {
            status.textContent = 'Scan completed';
          }
          scanBtn.textContent = 'Scan Page';
          scanBtn.disabled = false;
          isScanning = false;
        });
      } catch (error) {
        status.textContent = 'Error: ' + error.message;
        alert('Error: ' + error.message);
        scanBtn.textContent = 'Scan Page';
        scanBtn.disabled = false;
        isScanning = false;
      }
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', function() {
      chrome.storage.local.get(['userId'], function(result) {
        if (result.userId) {
          chrome.tabs.create({ url: 'http://localhost:8080/?tab=dashboard' });
        } else {
          chrome.tabs.create({ url: 'http://localhost:8080/?tab=account' });
        }
      });
    });
  }

  if (enableToggle) {
    enableToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      const isActive = this.classList.contains('active');
      status.textContent = isActive ? 'Active' : 'Disabled';
      chrome.storage.sync.set({ extensionEnabled: isActive });
    });
  }

  function showAuthInterface() {
    authContainer.style.display = 'block';
    mainContainer.style.display = 'none';
  }

  function showMainInterface() {
    authContainer.style.display = 'none';
    mainContainer.style.display = 'block';
    if (currentUser) {
      userInfo.textContent = `Logged in as: ${currentUser.email}`;
    }
    chrome.storage.sync.get(['extensionEnabled'], function(result) {
      if (result.extensionEnabled) {
        enableToggle.classList.add('active');
        status.textContent = 'Active';
      }
    });
  }
  
  function displayResults(results) {
    if (!results || !results.scores) return;
    const categories = {
      fake_info: 'Fake Info',
      violence: 'Violence',
      drugs: 'Drugs',
      guns: 'Guns',
      ai_generated: 'AI Generated',
      nudity: 'Nudity'
    };
    let html = `<div style="margin-bottom: 10px; font-weight: bold;">Overall Score: ${results.overall_score || 0}/100</div>`;
    for (const [key, value] of Object.entries(results.scores)) {
      const categoryName = categories[key] || key;
      const score = value || 0;
      const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
      html += `<div class="result-item">
        <div class="category">${categoryName}</div>
        <div class="score-bar">
          <div class="score-fill ${level}" style="width: ${score}%"></div>
        </div>
        <div class="score">${score}</div>
      </div>`;
    }
    scanResults.innerHTML = html;
  }
});
