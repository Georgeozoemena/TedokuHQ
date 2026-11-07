# Vercel Deployment Guide

## Prerequisites
- GitHub repository created: ✅ https://github.com/Georgeozoemena/TedokuHQ
- Supabase project created and configured: ✅
- Admin emails added to database: ✅

## Deploy to Vercel

### Step 1: Import Project to Vercel

1. Go to https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and select: **Georgeozoemena/TedokuHQ**
5. Click **"Import"**

### Step 2: Configure Project Settings

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `./` (default)  
**Build Command:** `npm run build` (auto-detected)  
**Output Directory:** `.next` (auto-detected)

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add ALL of these:

#### Required Variables:

```bash
# Download
APK_URL=https://your-direct-apk-download-link.apk

# Site
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Privacy / Tracking
IP_HASH_SALT=1a45f876c22e4a5a8d7a1c827648584eeea9635360bfeb4c99a87453ae7794ff
CRON_SECRET=c416afd29ab292011a839fb9367bfc9e2661998dbe0e8c7533234eb2d0540240

# Supabase (Copy from your .env.local)
NEXT_PUBLIC_SUPABASE_URL=https://ygqubnysmjfdjfrhvhla.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin
ADMIN_EMAILS=detechbishop@gmail.com,vaikosenkaitlyn2@gmail.com
```

**Important:**
- Copy the Supabase keys from your `.env.local`
- Update `NEXT_PUBLIC_SITE_URL` after deployment with your actual Vercel URL
- Update `APK_URL` with your actual direct download link

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. You'll get a URL like: `https://tedokuhq.vercel.app`

### Step 5: Update Site URL

After deployment:

1. Copy your Vercel deployment URL
2. Go back to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_SITE_URL` to your actual URL: `https://tedokuhq.vercel.app`
4. Click **"Save"**
5. Redeploy from the **Deployments** tab

### Step 6: Update Supabase Auth URLs

In your Supabase project:

1. Go to **Authentication** → **URL Configuration**
2. Update **Site URL** to: `https://tedokuhq.vercel.app`
3. Add to **Redirect URLs**:
   - `https://tedokuhq.vercel.app/admin/auth/callback`
   - Keep the localhost one for local development

### Step 7: Test Your Deployment

1. Visit `https://your-domain.vercel.app`
2. Visit `https://your-domain.vercel.app/admin` (should redirect to login)
3. Try signing in with your admin email
4. Check the download tracking works

## Automatic Deployments

Vercel is now connected to your GitHub repository. Every time you push to the `main` branch, Vercel will automatically deploy the changes.

## Custom Domain (Optional)

To add a custom domain:

1. Go to your Vercel project
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `tedoku.app`)
4. Update DNS records as instructed by Vercel
5. Update `NEXT_PUBLIC_SITE_URL` in environment variables
6. Update Supabase auth URLs

## Troubleshooting

### Build Fails
- Check the build logs in Vercel
- Ensure all environment variables are set
- Run `npm run build` locally to test

### Admin Login Not Working
- Verify Supabase redirect URLs include your Vercel domain
- Check environment variables are correct
- Ensure admin emails are in the database

### Cron Job for Retention
- Vercel automatically configures the cron job from `vercel.json`
- It runs daily at 03:17 UTC
- Check the function logs in Vercel dashboard

## Security Checklist

Before going live:

- [ ] All environment variables are set in Vercel (not committed to git)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in Vercel environment (never in code)
- [ ] Admin emails are configured in both `ADMIN_EMAILS` and database
- [ ] APK_URL points to a secure, direct download link
- [ ] Supabase Row Level Security policies are active
- [ ] Test admin login and dashboard access
- [ ] Test download tracking
- [ ] Review privacy page content for your use case

## What's Already Configured

✅ Security headers (CSP, HSTS, etc.)
✅ Admin authentication with Supabase
✅ Download tracking with privacy protection
✅ Nightly data retention cleanup (13 months)
✅ Bot detection and filtering
✅ Rate limiting
✅ Row Level Security in database

## Repository

GitHub: https://github.com/Georgeozoemena/TedokuHQ

## Next Steps

1. Deploy to Vercel following the steps above
2. Update APK_URL with your real download link
3. Test the admin dashboard
4. Customize the landing page content (see README.md)
5. Update privacy and terms pages with your legal details
