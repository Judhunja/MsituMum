const API_BASE_URL = 'http://localhost:5000/api';

// Authentication utilities
const auth = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  logout() {
    // Call logout API endpoint
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    }).catch(err => console.log('Logout API call failed:', err));
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  checkAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// API call wrapper
async function apiCall(endpoint, options = {}) {
  const token = auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      auth.logout();
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Utility functions
function formatNumber(num) {
  if (!num) return '0';
  return num.toLocaleString();
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '--';
  return `${Number(value).toFixed(decimals)}%`;
}

function showNotification(message, type = 'info') {
  // Simple notification (can be enhanced with a library)
  alert(message);
}

function logout() {
  auth.logout();
}

// Login handler
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('hidden');
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      const data = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (data.token) {
        auth.setToken(data.token);
        auth.setUser(data.user);
        window.location.href = '/dashboard.html';
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      errorDiv.classList.remove('hidden');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// Register handler
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('hidden');
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating account...';
    
    try {
      const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        full_name: document.getElementById('full_name').value,
        organization: document.getElementById('organization').value,
        phone: document.getElementById('phone').value
      };
      
      const data = await apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (data.token) {
        auth.setToken(data.token);
        auth.setUser(data.user);
        window.location.href = '/dashboard.html';
      }
    } catch (error) {
      errorDiv.textContent = error.message || 'Registration failed. Please try again.';
      errorDiv.classList.remove('hidden');
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
}

// DO NOT auto-check auth here - let pages control when to check
// This is because the script runs immediately when loaded
