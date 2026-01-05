# Database Setup Instructions

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - Name: `goal-setter-app`
   - Database Password: (choose a strong password)
   - Region: (select closest to you)
5. Wait for project to be created (~2 minutes)

### 2. Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `schema.sql`
4. Paste into the SQL editor
5. Click **Run** or press `Ctrl/Cmd + Enter`

You should see success messages for all table creations.

### 3. Get Your API Keys

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhb...` (long string)

### 4. Configure Environment Variables

1. In the frontend directory, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ANTHROPIC_API_KEY=your-anthropic-key-here
   ```

### 5. Enable Anonymous Authentication (for single-user mode)

1. Go to **Authentication** → **Providers**
2. Find **Anonymous Sign-ins**
3. Toggle it **ON**
4. Click **Save**

### 6. Verify Setup

Run this query in the SQL Editor to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: `users`, `goals`, `progress_logs`, `notifications`, `user_api_keys`

## Database Schema Overview

### Tables

- **users**: User accounts and subscription info
- **goals**: All goals (yearly, monthly, weekly, daily)
- **progress_logs**: Historical progress tracking
- **notifications**: In-app notifications and weekly summaries
- **user_api_keys**: Encrypted storage for user LLM API keys

### Key Features

- **Row Level Security (RLS)**: Automatically enforced per-user data isolation
- **Cascading Deletes**: Deleting a parent goal deletes all children
- **Auto Timestamps**: `created_at` and `updated_at` handled automatically
- **Progress Calculation**: Built-in function to calculate goal progress

## Troubleshooting

### "relation does not exist" error
- Make sure you ran the entire `schema.sql` file
- Check that you're in the correct project

### Authentication errors
- Verify anonymous auth is enabled
- Check your API keys in `.env`

### RLS policy errors
- Ensure you're authenticated (anonymous session created)
- Check that `auth.uid()` matches `user_id`

## Future Migrations

When you need to modify the schema:

1. Create a new file: `migrations/001_description.sql`
2. Add your ALTER TABLE statements
3. Run in SQL Editor
4. Update `database.types.ts` if needed
