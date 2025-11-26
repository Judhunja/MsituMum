# Deploying MsituMum to Vercel

This guide will help you deploy the MsituMum Forest Restoration Intelligence System to Vercel.

## Prerequisites

- Vercel account (free tier works)
- Supabase project (for authentication and users table)
- Git repository

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin master
```

## Step 2: Set Up Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Run the SQL from `supabase-setup.sql` to create the users table
4. Note your **Project URL** and **Anon Key** from Settings → API

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## Step 4: Configure Environment Variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
JWT_SECRET=your-random-secret-key
```

## Step 5: Update CORS Settings

After deployment, update `server/index.js` line 13 with your actual Vercel domain:

```javascript
origin: process.env.NODE_ENV === 'production' 
  ? ['https://your-actual-domain.vercel.app'] 
  : ['http://localhost:3000', 'http://localhost:5000'],
```

Then redeploy:
```bash
git add .
git commit -m "Update CORS for production"
git push origin master
```

## Step 6: Configure Client API URL

Update `/client/js/auth.js` line 1 to use environment-based URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : '/api';
```

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test registration: `https://your-project.vercel.app/register.html`
3. Test login: `https://your-project.vercel.app/login.html`
4. Check dashboard: `https://your-project.vercel.app/dashboard.html`

## Troubleshooting

### 500 Internal Server Error
- Check Vercel Function Logs in the dashboard
- Verify all environment variables are set correctly
- Ensure Supabase URL and keys are correct

### 404 Not Found
- Verify `vercel.json` routes are correct
- Check that all files are committed to Git
- Ensure build succeeded in Vercel dashboard

### Authentication Issues
- Verify Supabase credentials
- Check that users table was created in Supabase
- Ensure CORS is configured correctly

### API Calls Failing
- Check browser console for errors
- Verify API_BASE_URL in `client/js/auth.js`
- Check Vercel Function logs

## Performance Optimization

The app is already optimized with:
- Resource preloading
- Async script loading
- API response caching (30s)
- Parallel API requests
- Font optimization

## Database Considerations

**Important**: SQLite (used for application data) doesn't work well on Vercel's serverless functions because the filesystem is read-only and ephemeral. Consider these options:

### Option 1: Migrate to Supabase (Recommended)
Move all data from SQLite to Supabase PostgreSQL tables.

### Option 2: Use Vercel Postgres
Set up Vercel Postgres for your data storage.

### Option 3: Use Planetscale or Neon
Use a serverless PostgreSQL service.

## Continuous Deployment

Vercel automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Your changes"
git push origin master
```

## Custom Domain

1. Go to **Settings → Domains** in Vercel
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS settings with your custom domain

## Monitoring

- **Vercel Analytics**: Enable in project settings
- **Function Logs**: Check in Vercel dashboard
- **Error Tracking**: Set up Sentry (optional)

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Project Issues: GitHub Issues

---

**Note**: For production use with SQLite, consider migrating to a proper database service like Supabase PostgreSQL or Vercel Postgres.
