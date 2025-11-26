import { auth } from './supabase-auth.js';

// Check authentication
(async () => {
  const isAuth = await auth.isAuthenticated();
  if (!isAuth) {
    window.location.href = '/login.html';
  }
})();
