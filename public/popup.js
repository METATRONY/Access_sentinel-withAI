// Supabase configuration
const SUPABASE_URL = 'https://qzrcbuzvgcyahevtsfms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6cmNidXp2Z2N5YWhldnRzZm1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NzgzNjAsImV4cCI6MjA3MjU1NDM2MH0.eeHYAJGJeYYqFZgFJGJhKgGgGgGgGgGgGgGgGgGgGgG';

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async signUp(email, password) {
    const response = await fetch(`${this.url}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async signIn(email, password) {
    const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.key
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  }

  async getUser(token) {
    const response = await fetch(`${this.url}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': this.key
      }
    });
    return response.json();
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status
  const token = await getStoredToken();
  if (token) {
    showMainInterface(token);
  } else {
    showAuthInterface();
  }

  // Auth tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabType = tab.dataset.tab;
      switchAuthTab(tabType);
    });
  });

  // Login form
  document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await supabase.signIn(email, password);
      if (result.access_token) {
        await storeToken(result.access_token, result.user);
        showMainInterface(result.access_token);
      } else {
        alert('Login failed: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Login error: ' + error.message);
    }
  });

  // Signup form
  document.getElementById('signupBtn').addEventListener('click', async () => {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await supabase.signUp(email, password);
      if (result.user) {
        alert('Account created! Please check your email to verify your account, then login.');
        switchAuthTab('login');
      } else {
        alert('Signup failed: ' + (result.error?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Signup error: ' + error.message);
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await chrome.storage.local.remove(['userToken', 'userInfo']);
    showAuthInterface();
  });

  // Toggle functionality
  document.getElementById('enableToggle').addEventListener('click', async () => {
    const toggle = document.getElementById('enableToggle');
    const isEnabled = !toggle.classList.contains('active');
    
    if (isEnabled) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
    
    // Store the setting
    await chrome.storage.local.set({ extensionEnabled: isEnabled });
    
    // Notify background script
    chrome.runtime.sendMessage({ 
      type: 'TOGGLE_EXTENSION', 
      enabled: isEnabled 
    });
  });

  // Dashboard button
  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  // Load stats
  loadStats();
});

function switchAuthTab(tabType) {
  // Update tab appearance
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabType}"]`).classList.add('active');

  // Show/hide forms
  if (tabType === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
  } else {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
  }
}

function showAuthInterface() {
  document.getElementById('authContainer').classList.add('active');
  document.getElementById('mainContainer').style.display = 'none';
}

async function showMainInterface(token) {
  document.getElementById('authContainer').classList.remove('active');
  document.getElementById('mainContainer').style.display = 'block';
  
  // Load user info
  try {
    const user = await supabase.getUser(token);
    if (user.email) {
      document.getElementById('userInfo').textContent = `Logged in as: ${user.email}`;
    }
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

async function getStoredToken() {
  const result = await chrome.storage.local.get(['userToken']);
  return result.userToken;
}

async function storeToken(token, user) {
  await chrome.storage.local.set({ 
    userToken: token,
    userInfo: user
  });
}

async function loadStats() {
  const result = await chrome.storage.local.get(['stats']);
  const stats = result.stats || { scanned: 0, blocked: 0, blurred: 0 };
  
  document.getElementById('scannedCount').textContent = stats.scanned;
  document.getElementById('blockedCount').textContent = stats.blocked;
  document.getElementById('blurredCount').textContent = stats.blurred;
}