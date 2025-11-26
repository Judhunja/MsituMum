import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Authentication utilities
export const auth = {
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getToken() {
    return localStorage.getItem('supabase.auth.token');
  },

  async setSession(session) {
    if (session) {
      localStorage.setItem('supabase.auth.token', session.access_token);
      localStorage.setItem('user', JSON.stringify(session.user));
    }
  },

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  async checkAuth() {
    const isAuth = await this.isAuthenticated();
    if (!isAuth) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
};

// API call wrapper for Supabase
export async function apiCall(table, operation = 'select', options = {}) {
  try {
    let query = supabase.from(table);

    switch (operation) {
      case 'select':
        query = query.select(options.columns || '*');
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        if (options.order) {
          query = query.order(options.order.column, { ascending: options.order.ascending });
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        break;

      case 'insert':
        query = query.insert(options.data);
        break;

      case 'update':
        query = query.update(options.data);
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        break;

      case 'delete':
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        query = query.delete();
        break;
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase Error:', error);
    throw error;
  }
}

// Utility functions
export function formatNumber(num) {
  if (!num) return '0';
  return num.toLocaleString();
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '--';
  return `${Number(value).toFixed(decimals)}%`;
}

export function showNotification(message, type = 'info') {
  // Simple notification
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };
  
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 ${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg z-50`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

export function logout() {
  auth.logout();
}

// Login handler
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.classList.add('hidden');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      await auth.setSession(data.session);
      window.location.href = '/dashboard.html';
    } catch (error) {
      errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
      errorDiv.classList.remove('hidden');
    }
  });
}

// Register handler
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    errorDiv?.classList.add('hidden');
    successDiv?.classList.add('hidden');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const fullName = document.getElementById('fullName')?.value;
    const username = document.getElementById('username')?.value;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username
          }
        }
      });

      if (error) throw error;

      if (successDiv) {
        successDiv.textContent = 'Registration successful! Please check your email to verify your account.';
        successDiv.classList.remove('hidden');
      }
      
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } catch (error) {
      if (errorDiv) {
        errorDiv.textContent = error.message || 'Registration failed. Please try again.';
        errorDiv.classList.remove('hidden');
      }
    }
  });
}
