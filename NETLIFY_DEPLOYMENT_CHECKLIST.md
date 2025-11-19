# Netlify Deployment Checklist

## ✅ Configuration Files (Already Set Up)

Your `netlify.toml` file is configured correctly with:
- Build command: `npm run build:netlify && npm run postbuild:netlify`
- Publish directory: `dist/portfolio-fe/browser`
- Node version: 18
- Redirects configured

## 🔍 What to Check in Netlify Dashboard

### If you're setting up a NEW site:
1. Go to [app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. **Netlify will auto-detect settings from `netlify.toml`** - you don't need to change anything!

### If you have an EXISTING site:
1. Go to your site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Build settings**
3. Check these settings match your `netlify.toml`:

   **Build command:**
   ```
   npm run build:netlify && npm run postbuild:netlify
   ```

   **Publish directory:**
   ```
   dist/portfolio-fe/browser
   ```

   **Node version:**
   ```
   18
   ```

4. If settings don't match, either:
   - **Option A (Recommended):** Delete the manual settings and let Netlify use `netlify.toml`
   - **Option B:** Update them manually to match the values above

## 🚀 Deployment Steps

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Configure Netlify deployment"
   git push
   ```

2. **Trigger a new deployment:**
   - Netlify will auto-deploy on push, OR
   - Go to **Deploys** tab → Click **Trigger deploy** → **Clear cache and deploy site**

3. **Verify the build:**
   - Check the build logs to ensure:
     - `npm run build:netlify` runs successfully
     - `npm run postbuild:netlify` runs successfully
     - You see: "✓ Copied index.csr.html to index.html"
     - You see: "✓ Copied _redirects file to browser directory"

## ⚠️ Common Issues

### Build fails with "command not found"
- Make sure Node version is set to 18 or higher
- Check that `scripts/fix-netlify-build.js` exists in your repo

### Still getting 404 errors
- Verify `_redirects` file is in `dist/portfolio-fe/browser` after build
- Check that `index.html` exists (not just `index.csr.html`)
- Look at the build logs to confirm the postbuild script ran

### Settings not updating
- Clear Netlify cache: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
- Or delete and recreate the site to use fresh settings

## 📝 Summary

**You DON'T need to manually update deployment commands** if:
- ✅ Your `netlify.toml` file is in the repository root
- ✅ You're setting up a new site (auto-detects from toml)
- ✅ You've removed manual overrides in Netlify dashboard

**You DO need to update** if:
- ❌ You have manual build settings in Netlify dashboard that override `netlify.toml`
- ❌ The build command or publish directory is different in the dashboard

