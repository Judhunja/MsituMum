# Supabase Setup Instructions

## Overview
MsituMum has been migrated to use Supabase for authentication. Follow these steps to complete the setup.

## Step 1: Create the Users Table

1. Go to your Supabase Dashboard: https://lmcmxqbzqsudvqxutpuf.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase-setup.sql` file
5. Click "Run" to execute the SQL

The SQL script will:
- Create a `users` table linked to Supabase Auth
- Add indexes for fast username/email lookups
- Enable Row Level Security (RLS)
- Create policies so users can only access their own data

## Step 2: Verify the Setup

After running the SQL, you should see:
- A message: "Users table created successfully!"
- The `users` table in your database with columns: id, username, email, full_name, organization, phone, created_at

## Step 3: Test the Application

1. Make sure your server is running:
   ```bash
   npm start
   ```

2. Open your browser to http://localhost:5000

3. **Register a new user**:
   - Go to http://localhost:5000/register.html
   - Fill in all required fields (Full Name, Username, Email, Password)
   - Organization and Phone are optional
   - Click "Create Account"

4. **Login**:
   - Go to http://localhost:5000/login.html
   - You can log in with either:
     - Your email address
     - Your username
   - Enter your password
   - Click "Login"

## How It Works

### Authentication Flow

1. **Registration** (`POST /api/auth/register`):
   - Creates user in Supabase Auth with `signUp()`
   - Stores additional user info in the `users` table
   - Returns a session token
   - User is automatically logged in

2. **Login** (`POST /api/auth/login`):
   - Accepts email OR username
   - If username is provided, queries `users` table to get the email
   - Uses Supabase `signInWithPassword()` with email
   - Returns session token

3. **Protected Routes**:
   - Frontend sends token in `Authorization: Bearer <token>` header
   - Backend verifies token with `supabase.auth.getUser(token)`

### Database Schema

**users table**:
```sql
id          UUID (references auth.users.id)
username    TEXT UNIQUE NOT NULL
email       TEXT NOT NULL
full_name   TEXT
organization TEXT
phone       TEXT
created_at  TIMESTAMP WITH TIME ZONE
```

## Troubleshooting

### "Users table does not exist" error
- Make sure you ran the SQL script in Supabase
- Check that the table was created in the "Table Editor"

### "User already registered" error
- Try a different email or username
- Or go to Supabase Authentication tab and delete the test user

### Login not working
- Make sure you're using the correct credentials
- Check browser console for errors
- Verify that Supabase credentials in `.env` are correct

### Token errors
- Make sure SUPABASE_ANON_KEY is set correctly in `.env`
- The anon key should be the "anon/public" key, not the service role key

## Environment Variables

Make sure these are set in your `.env` file:

```env
SUPABASE_URL=https://lmcmxqbzqsudvqxutpuf.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY214cWJ6cXN1ZHZxeHV0cHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0NTk5MzksImV4cCI6MjA1MzAzNTkzOX0.1pjCLMlCmr0C-d2Txi4WQqEYf0NGxK4RIlh60DudVYc
PORT=5000
```

## Next Steps

Once authentication is working:
1. Test the dashboard at http://localhost:5000/dashboard.html
2. Test the nursery form at http://localhost:5000/forms/nursery-form.html
3. Add more features and forms as needed

## Migration Notes

The old SQLite-based authentication has been backed up to:
- `server/routes/auth-old.js`

If you need to revert, you can:
1. `mv server/routes/auth-old.js server/routes/auth.js`
2. Remove Supabase dependencies
3. Restart the server
