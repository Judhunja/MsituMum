const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const supabase = require('../config/supabase');

// Register new user
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().notEmpty().withMessage('Full name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, full_name, organization, phone } = req.body;

      // Sign up with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name,
            organization,
            phone
          }
        }
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        return res.status(400).json({ error: signUpError.message });
      }

      // Also store user in users table for username lookup
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            username,
            email,
            full_name,
            organization,
            phone
          }
        ]);

      if (insertError) {
        console.error('Error inserting user to table:', insertError);
      }

      res.status(201).json({
        message: 'User registered successfully',
        token: authData.session?.access_token,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          username,
          full_name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username/email and password are required' });
    }

    // Check if username is an email
    const isEmail = username.includes('@');
    
    let authData, signInError;

    if (isEmail) {
      // Sign in with email
      const result = await supabase.auth.signInWithPassword({
        email: username,
        password
      });
      authData = result.data;
      signInError = result.error;
    } else {
      // For username login, we need to query users table first to get email
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('email')
        .eq('username', username)
        .single();

      if (queryError || !users) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Now sign in with the found email
      const result = await supabase.auth.signInWithPassword({
        email: users.email,
        password
      });
      authData = result.data;
      signInError = result.error;
    }

    if (signInError) {
      console.error('Supabase signin error:', signInError);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!authData.session) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      token: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username: authData.user.user_metadata?.username,
        full_name: authData.user.user_metadata?.full_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Logout failed' });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name,
        organization: user.user_metadata?.organization,
        phone: user.user_metadata?.phone
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
