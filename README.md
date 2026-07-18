# Taskflow

Taskflow is a modern, responsive Task Management Application designed to help you organize, track, and accomplish your day-to-day tasks.

## Features

- **User Authentication**: Secure sign-up, login, and sign-out powered by Supabase.
- **Task Management**: Create, read, edit, delete, and toggle completion status of tasks.
- **Task Metadata**:
  - Task Title and Description
  - Priority levels (Low, Medium, High)
  - Due Dates with automated overdue alerts
- **Filtering & Sorting**:
  - Filter tasks by status (All, Active, Completed)
  - Filter tasks by priority (All, Low, Medium, High)
  - Sort tasks by Created Date or Due Date
- **Modern UI**: Clean and beautiful dark-themed interface built using glassmorphism principles and CSS variables.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## Getting Started

First, install dependencies:

```bash
npm install
```

Configure your local environment variables in a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

