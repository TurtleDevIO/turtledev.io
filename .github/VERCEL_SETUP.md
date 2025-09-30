# Vercel Deployment Setup

This repository uses GitHub Actions to automatically deploy to Vercel on every PR and merge to main.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. Get Vercel Token

1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token

### 2. Get Vercel Project ID and Org ID

Run these commands in your project directory:

```bash
# This will show your project info
cat .vercel/project.json
```

You'll see output like:
```json
{
  "orgId": "team_xxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxx"
}
```

### 3. Add Secrets to GitHub

Go to your repository settings → Secrets and variables → Actions → New repository secret

Add these three secrets:

- **VERCEL_TOKEN**: Your Vercel token from step 1
- **VERCEL_ORG_ID**: The `orgId` from `.vercel/project.json`
- **VERCEL_PROJECT_ID**: The `projectId` from `.vercel/project.json`

## How It Works

### Pull Requests
- Every PR triggers a preview deployment
- The PR gets a comment with the preview URL
- You can test changes before merging

### Main Branch
- Pushes to `main` trigger a production deployment
- Automatically promotes the build to production

## Manual Deployment

You can still deploy manually:

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```
