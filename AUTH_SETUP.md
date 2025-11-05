# Authentication Setup

## What We Have

Your Wichtel Wizard app uses **NextAuth.js** for simple, passwordless authentication.

## How It Works

### User Flow:
1. User visits the app
2. Enters their email address
3. Instantly logged in (no email verification needed)
4. Session persists across devices

### Technical Details:
- **Provider**: NextAuth.js with Credentials provider
- **Session**: JWT-based (stored in HTTP-only cookies)
- **Database**: User accounts stored in Neon Postgres
- **No emails**: Users just enter email and get instant access

## Database Schema

### Auth Tables (NextAuth.js):
- `User` - User accounts (email, name)
- `Account` - OAuth accounts (not used currently)
- `Session` - Active sessions (not used with JWT strategy)
- `VerificationToken` - For email verification (not used)

### App Tables:
- `Group` - Wichteln groups
- `Participant` - Links users to groups with anonymous names
- `Wish` - User wishlists
- `Assignment` - Secret Santa pairings

## Environment Variables

Required in `.env.local`:

```bash
# Database (from Vercel/Neon)
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth.js
AUTH_SECRET="your-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Stack Auth (Ignored)

When you created the database in Vercel, it asked about adding auth and added **Stack Auth**.
We're **not using it** - we built our own with NextAuth.js instead.

The `STACK_*` environment variables can be safely ignored/removed.

## Why This Approach?

✅ **Simple**: No email verification, no magic links
✅ **Fast**: Instant login
✅ **Secure**: JWT session management
✅ **Multi-device**: Same email = same account
✅ **Anonymous in groups**: Email for login, anonymous names in each group

## How Users Are Tracked

- **Login**: Email serves as user ID
- **Groups**: Each user gets a unique anonymous name per group (e.g., "Jolly Reindeer")
- **Privacy**: Only your email is stored, anonymous names are visible to group members

## Future Enhancements (Optional)

If you want to add later:
- Email magic links (switch to Resend provider)
- OAuth (Google, GitHub, etc.)
- Email notifications when Wichteln is drawn
- Password-based auth
