---
name: deploy_taskflow
description: Guides deployment of the Taskflow Next.js app to Vercel or other hosting environments, including environment verification, builds, and sanity checks.
---

# Deploy Taskflow Application

This skill provides step-by-step instructions for preparing, building, and deploying the Taskflow application to a hosting environment (e.g., Vercel, Netlify, or self-hosted servers).

## Prerequisites and Environment Setup

Before executing a deployment, verify that all necessary environment variables are set in the deployment dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`: The API URL of the Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous API key of the Supabase project.

Ensure that the database schema is initialized. You can find the database structure in [schema.sql](file:///home/hema/Taskflow/schema.sql).

## Deployment Steps

### 1. Verification and Sanity Checks

Always run a production build locally to verify there are no TypeScript or compilation errors before pushing to the deployment branch:

```bash
npm install
npm run build
```

Ensure no compilation errors, unused imports, or incorrect TypeScript types exist.

### 2. Deploying to Vercel (Recommended)

Vercel is the primary recommended platform for Next.js applications.

#### Option A: Git Integration (Recommended)
1. Push changes to the `main` branch:
   ```bash
   git push origin main
   ```
2. Connect your GitHub repository `https://github.com/HemaRajaprabu/Flowsmartnew` to Vercel.
3. Vercel will automatically detect Next.js and deploy on every push to `main`.
4. Configure environment variables in the Vercel dashboard:
   - Go to Project Settings -> Environment Variables.
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

#### Option B: Vercel CLI (Manual Deployment)
To manually deploy via CLI:
```bash
npx vercel
```
To deploy to production:
```bash
npx vercel --prod
```
