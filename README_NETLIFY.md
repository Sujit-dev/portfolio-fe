# Netlify Deployment Guide

This guide will help you deploy your Angular portfolio to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://www.netlify.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Netlify UI (Recommended)

1. **Log in to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in or create an account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - Netlify will auto-detect the settings from `netlify.toml`
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/portfolio-fe/browser`
   - Node version: 18 (or higher)

4. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live!

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Site**
   ```bash
   cd portfolio-frontend
   netlify init
   ```
   - Follow the prompts to link your site

4. **Deploy**
   ```bash
   npm run build:netlify
   netlify deploy --prod
   ```

## Configuration Files

- **netlify.toml**: Contains build settings and redirects
- **public/_redirects**: Handles SPA routing (redirects all routes to index.html)

## Build Process

The build process:
1. Runs `npm install` to install dependencies
2. Runs `npm run build:netlify` which executes `ng build --configuration production`
3. Publishes the `dist/portfolio-fe/browser` directory

## Environment Variables

If you need to set environment variables:
1. Go to Site settings → Environment variables
2. Add your variables (e.g., API keys, endpoints)
3. They will be available during build time

## Custom Domain

To add a custom domain:
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Continuous Deployment

Netlify automatically deploys when you:
- Push to your main/master branch
- Create a pull request (creates a preview deployment)

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure Node version is 18 or higher
- Verify all dependencies are in `package.json`

### 404 Errors on Routes
- Ensure `public/_redirects` file exists
- Check that `netlify.toml` has the redirect rule

### Assets Not Loading
- Verify the publish directory is `dist/portfolio-fe/browser`
- Check that assets are in the `public` folder

## Support

For more help, visit:
- [Netlify Documentation](https://docs.netlify.com/)
- [Angular Deployment Guide](https://angular.dev/guide/deployment)

