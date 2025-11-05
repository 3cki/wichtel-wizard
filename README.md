# Wichteln Wizard

A modern web application for organizing Secret Santa ("Wichteln") gift exchanges with friends, family, or colleagues.

## Features

- Create and join Wichteln groups with unique codes
- Automatic anonymous name generation (fun Christmas-themed names)
- Wishlist management - add multiple gift ideas
- Automated Secret Santa assignment algorithm
- View your Secret Santa match and their wishlist
- Beautiful, responsive UI with Tailwind CSS and shadcn/ui
- PostgreSQL database with Prisma ORM

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Vercel Postgres for production)
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (local or Vercel Postgres)

### Local Development

1. Clone the repository:
```bash
git clone <your-repo-url>
cd wichteln
```

2. Install dependencies:
```bash
npm install
```

3. Set up your database:
```bash
# Start a local Prisma Postgres instance
npx prisma dev

# Or update DATABASE_URL in .env with your PostgreSQL connection string
```

4. Generate Prisma client:
```bash
DATABASE_URL="your-connection-string" npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment on Vercel

1. Push your code to GitHub

2. Import your repository to Vercel

3. Add a Vercel Postgres database:
   - Go to your project's Storage tab
   - Create a new Postgres database
   - Vercel will automatically set the required environment variables

4. Update `prisma/schema.prisma` datasource to use Vercel Postgres variables:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
```

5. Add a build script to run Prisma migrations:
   - In your Vercel project settings, add a build command or use the automatic detection

6. Deploy!

## How It Works

1. **Create a Group**: Start a new Wichteln group and get a unique 6-character code
2. **Invite Participants**: Share the group code with friends and family
3. **Join & Add Wishes**: Participants join using the code, get an anonymous name, and create their wishlist
4. **Draw Secret Santa**: Once everyone has joined, draw the Secret Santa assignments
5. **View Your Match**: See who you're buying for and check their wishlist

## Database Schema

- **Group**: Wichteln groups with unique codes
- **Participant**: Group members with anonymous names
- **Wish**: Gift ideas added by participants
- **Assignment**: Secret Santa pairings (created when drawing)

## Project Structure

```
wichteln/
├── app/
│   ├── api/          # API routes
│   ├── create/       # Group creation page
│   ├── group/[code]/ # Group detail page
│   └── page.tsx      # Homepage
├── components/
│   └── ui/           # shadcn/ui components
├── lib/
│   ├── prisma.ts     # Prisma client
│   └── name-generator.ts # Anonymous name generator
├── prisma/
│   └── schema.prisma # Database schema
└── public/           # Static assets
```

## License

MIT
