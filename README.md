# ProductiveMe - Global Productivity Dashboard

A comprehensive productivity application with cloud sync, AI insights, focus modes, habit tracking, and more.

## 🚀 Features

- **Task Management** - Smart todo system with categories, priorities, and deadlines
- **AI Insights** - Intelligent productivity analysis and personalized suggestions
- **Focus Mode** - Distraction-free deep work sessions with ambient sounds
- **Habit Tracker** - Visual habit formation with streak tracking
- **Quick Capture** - Instant thought and idea capture system
- **Spaced Repetition** - Automated task review scheduling
- **Progress Analytics** - Comprehensive productivity metrics and charts
- **Cloud Sync** - Access your data from anywhere in the world
- **Dark/Light Mode** - Beautiful themes for any preference

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Charts**: Recharts
- **UI Components**: Radix UI + shadcn/ui

## 📦 Deployment Guide

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the `scripts/create-database.sql` file
3. Copy your project URL and anon key from Settings > API

### 2. Environment Variables

Create a `.env.local` file:

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app
\`\`\`

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add the environment variables in Vercel dashboard
4. Deploy!

### 4. Data Migration

If you have existing local data:
1. Sign up/sign in to your deployed app
2. Use the migration tool to transfer localStorage data to the cloud
3. Export a backup before migration (recommended)

## 🔧 Local Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
\`\`\`

## 📊 Database Schema

The app uses 8 main tables:
- `users` - User authentication
- `todos` - Task management
- `revisions` - Spaced repetition
- `focus_sessions` - Deep work tracking
- `habits` - Habit formation
- `habit_completions` - Daily habit tracking
- `quick_notes` - Instant capture
- `user_preferences` - Settings and themes

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- User data is completely isolated
- Secure authentication with Supabase Auth
- Environment variables for sensitive data

## 🌍 Global Access

Once deployed, your ProductiveMe dashboard will be accessible from anywhere in the world with:
- Real-time data synchronization
- Offline-first design (coming soon)
- Cross-device compatibility
- Secure cloud backup

## 📱 Mobile Support

Fully responsive design works perfectly on:
- Desktop computers
- Tablets
- Mobile phones
- Any screen size

---

Built with ❤️ for developers who want to stay productive anywhere in the world.
