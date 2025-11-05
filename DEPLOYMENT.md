# Deploying Wichteln Wizard to Vercel

This guide will walk you through deploying your Wichteln Wizard application to Vercel with Vercel Postgres.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Code

Before deploying, make sure your `prisma/schema.prisma` is configured for Vercel Postgres:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

## Step 2: Import Your Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Next.js project
5. Click "Deploy" (don't worry about environment variables yet)

## Step 3: Add Vercel Postgres Database

1. Once deployed, go to your project dashboard
2. Click on the "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Choose a database name (e.g., "wichteln-db")
6. Select your preferred region
7. Click "Create"

Vercel will automatically add these environment variables to your project:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

## Step 4: Run Database Migration

You have two options to set up your database schema:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Run Prisma migration:
```bash
npx prisma migrate deploy
# or
npx prisma db push
```

### Option B: Using Prisma Studio

1. Go to your Vercel project settings
2. Navigate to the "Storage" tab
3. Click on your Postgres database
4. Copy the `POSTGRES_URL_NON_POOLING` connection string
5. Run locally:
```bash
DATABASE_URL="<your-connection-string>" npx prisma db push
```

## Step 5: Redeploy Your Application

1. Go back to your Vercel project
2. Click "Deployments"
3. Click "Redeploy" on the latest deployment
   - Or make a new commit to trigger automatic deployment

## Step 6: Verify Deployment

1. Visit your deployed application URL
2. Try creating a new Wichteln group
3. Join the group and add some wishes
4. Test the Secret Santa draw functionality

## Troubleshooting

### Build Errors

If you encounter build errors related to Prisma:

1. Make sure your `package.json` build script includes `prisma generate`:
```json
"build": "prisma generate && next build"
```

2. Check that all environment variables are set in Vercel

### Database Connection Issues

If you can't connect to the database:

1. Verify environment variables in Vercel project settings
2. Make sure you're using the correct connection strings:
   - Use `POSTGRES_PRISMA_URL` for Prisma queries (pooled connection)
   - Use `POSTGRES_URL_NON_POOLING` for migrations (direct connection)

### Migration Issues

If migrations fail:

1. Try using `npx prisma db push` instead of `npx prisma migrate deploy`
2. Check Prisma logs in Vercel deployment logs
3. Verify your schema.prisma is valid

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Can create new groups
- [ ] Can join groups with codes
- [ ] Can add wishes to wishlist
- [ ] Secret Santa draw works correctly
- [ ] Assignments are displayed properly

## Continuous Deployment

Once set up, Vercel will automatically:
- Deploy when you push to your main branch
- Run the build script (including `prisma generate`)
- Keep your database connected

Just commit and push your changes, and Vercel handles the rest!

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
