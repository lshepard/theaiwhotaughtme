# Story Submission System Setup

This guide will help you set up the story submission page with Supabase database.

## What's Been Built

1. **Story Submission Page** (`/submit-story`)
   - Multi-step form with story textarea and contact info
   - Validation for required fields
   - Success confirmation

2. **Admin Panel** (`/admin`)
   - HTTP Basic Auth protected
   - View all submitted stories
   - Contact information for each submission

3. **API Endpoints**
   - `/api/submit-story` - Handle story submissions
   - `/api/admin/stories` - Fetch stories (auth protected)

## Setup Instructions

### 1. Create Supabase Database Table

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to the SQL Editor
4. Run this SQL to create the `stories` table:

```sql
CREATE TABLE stories (
  id BIGSERIAL PRIMARY KEY,
  story TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  school VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Only allow service role to read/write
-- This ensures only your API can access the data
CREATE POLICY "Service role only" ON stories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Admin Credentials (for /admin page)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

**To find your Supabase credentials:**
1. Go to your Supabase Dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the "service_role" key (not the anon key!) for `SUPABASE_SERVICE_ROLE_KEY`

**Security Notes:**
- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side and never exposed to the browser
- Change `ADMIN_PASSWORD` to a strong password
- Never commit `.env.local` to git (it's already in `.gitignore`)

### 3. Test the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the story submission page:
   ```
   http://localhost:3000/submit-story
   ```

3. Submit a test story

4. Visit the admin panel:
   ```
   http://localhost:3000/admin
   ```

5. Login with your configured credentials (from `.env.local`)

## Deployment to Vercel

1. Push your code to GitHub

2. Import the project to Vercel (if not already done)

3. Add the environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all three variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `ADMIN_USERNAME`
     - `ADMIN_PASSWORD`

4. Redeploy if needed

## Architecture Notes

This implementation uses **server-side API endpoints** rather than direct client-to-database access:

- ✅ Supabase keys never exposed to the browser
- ✅ Full control over validation and business logic
- ✅ Easy to add rate limiting, notifications, or other features later
- ✅ RLS policies keep the database locked down to service role only

## Pages & Routes

- **`/submit-story`** - Public story submission form
- **`/admin`** - Protected admin panel to review submissions

## Files Created

- `app/submit-story/page.tsx` - Story submission page (client component)
- `app/admin/page.tsx` - Admin panel (client component with auth)
- `app/api/submit-story/route.ts` - Story submission API endpoint
- `app/api/admin/stories/route.ts` - Admin API endpoint (with HTTP Basic Auth)
- `lib/db.ts` - Supabase client and database functions

## Customization

### Privacy Policy Link

Update the privacy policy link in `app/submit-story/page.tsx` around line 142:

```tsx
<a href="/privacy" className="text-blue-600 hover:underline">
  Privacy Policy
</a>
```

### School Dropdown

If you want to use a dropdown instead of a text input for schools, modify the school field in `app/submit-story/page.tsx` around line 189.

### Admin Credentials

To change admin credentials, update the environment variables in `.env.local` and Vercel.

## Troubleshooting

**"Failed to submit story"**
- Check that your Supabase credentials are correct in `.env.local`
- Verify the `stories` table exists in Supabase
- Check the browser console and terminal for error messages

**"Unauthorized" on admin page**
- Verify `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env.local`
- Make sure you're entering the correct credentials

**Database errors**
- Ensure RLS policies are set correctly (service role should have access)
- Check that all required columns exist in the `stories` table
