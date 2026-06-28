# EduVault — Vercel Deployment Guide

Complete step-by-step instructions to get EduVault live on Vercel.

---

## Option A — Deploy via Vercel Dashboard (Easiest)

### Step 1 — Push your code to GitHub

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/eduvault.git
git branch -M main
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use your GitHub account)
2. Click **"Add New Project"**
3. Click **"Import"** next to your `eduvault` repository
4. Vercel auto-detects Vite — confirm these settings:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Do not click Deploy yet** — go to Step 3 first

### Step 3 — Add Environment Variables

Still on the import screen, expand **"Environment Variables"** and add:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SITE_URL` | `https://your-domain.vercel.app` | Production, Preview, Development |
| `VITE_API_BASE_URL` | *(leave blank for now — using mock data)* | All |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Production |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | Preview, Development |
| `VITE_FIREBASE_API_KEY` | *(from Firebase Console)* | All |
| `VITE_FIREBASE_AUTH_DOMAIN` | *(from Firebase Console)* | All |
| `VITE_FIREBASE_PROJECT_ID` | *(from Firebase Console)* | All |
| `VITE_FIREBASE_APP_ID` | *(from Firebase Console)* | All |
| `VITE_SUPABASE_URL` | *(from Supabase Settings → API)* | All |
| `VITE_SUPABASE_ANON_KEY` | *(from Supabase Settings → API)* | All |

> ⚠️ Only add the variables you actually have right now. You can add more later under Project → Settings → Environment Variables.

### Step 4 — Deploy

Click **"Deploy"**. Vercel builds and deploys in ~1 minute.

Your site is now live at `https://eduvault-xxx.vercel.app` 🎉

---

## Option B — Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login
vercel login

# Deploy from your project folder (first time — interactive setup)
vercel

# Deploy to production
vercel --prod
```

---

## Option C — Auto-deploy via GitHub Actions (CI/CD)

The file `.github/workflows/deploy.yml` is already in your project.
It automatically deploys to Vercel on every push to `main`.

### Setup GitHub Secrets

Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these three secrets:

| Secret Name | How to get it |
|-------------|---------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel link` in your project folder, then check `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Same file → `projectId` |

Then add all your `VITE_*` environment variables as GitHub secrets too (same names).

Once set up: every `git push` to `main` triggers a production deploy. Every pull request gets a unique preview URL.

---

## Adding a Custom Domain

1. Vercel Dashboard → your project → **Domains**
2. Click **"Add Domain"** → enter `eduvault.com`
3. Vercel shows you DNS records to add. Go to your domain registrar and add:
   - An **A record** pointing to `76.76.21.21`
   - Or a **CNAME** pointing to `cname.vercel-dns.com`
4. SSL certificate is issued automatically within minutes

---

## Environment Variables — Quick Reference

### Where to manage them

| Situation | Where to set |
|-----------|-------------|
| Local development | `.env.local` file (never commit this) |
| Vercel production | Vercel Dashboard → Project → Settings → Environment Variables |
| GitHub Actions CI | GitHub → Repo → Settings → Secrets → Actions |

### All variables

```bash
# Required when backend is connected
VITE_API_BASE_URL=https://your-api.com/api
VITE_SITE_URL=https://eduvault.com

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxx   # production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx   # preview/dev

# Firebase
VITE_FIREBASE_API_KEY=AIzaSy_xxxx
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Optional
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

> **Important:** All Vite environment variables MUST start with `VITE_` to be accessible in the browser. Variables without this prefix are server-side only and will be `undefined` in your React code.

---

## After Every Backend Change

When you connect Firebase/Supabase or update any env variable on Vercel:

1. Go to Vercel → Project → Settings → Environment Variables → update the value
2. Go to Vercel → Project → Deployments → click the three dots on the latest deployment → **"Redeploy"**

Changes to env vars don't take effect until a redeploy.

---

## Troubleshooting

### Build fails with "Missing env vars"
→ Add the missing variables in Vercel → Settings → Environment Variables → Redeploy

### White screen after deploy
→ Check Vercel → Deployments → click the failed deploy → **"Build Logs"**
→ Most common cause: missing env variable or a JS syntax error

### Routes return 404 (e.g. `/courses` shows Vercel's 404 page)
→ Make sure `vercel.json` is in the root of your project — it's what tells Vercel to serve `index.html` for all routes

### "window is not defined" or similar SSR errors
→ Vercel runs Vite as a static build, not SSR. This shouldn't happen unless you add a Vercel serverless function later.

### Environment variable shows as `undefined` in the app
→ Make sure the variable name starts with `VITE_`
→ Make sure you redeployed after adding it
→ In dev, make sure you restarted `npm run dev` after editing `.env.local`
