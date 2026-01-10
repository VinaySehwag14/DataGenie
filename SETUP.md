# InsightsPro - Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Create `.env.local` file

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

### Step 2: Set up Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in with GitHub
3. Click "New Project"
   - Name: `insightspro`
   - Database Password: (generate and save it)
   - Region: **Southeast Asia (Singapore)** (closest to India)
   - Click "Create new project"

4. Wait 2 minutes for project to be created

5. Get your credentials:
   - Click "Project Settings" (gear icon in sidebar)
   - Go to "API" section
   - Copy these values to `.env.local`:
     - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon` `public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` `secret` → `SUPABASE_SERVICE_ROLE_KEY` (click "Reveal" first)

6. Set up database schema:
   - Click "SQL Editor" in sidebar
   - Click "New query"
   - Copy ALL content from `supabase_schema.sql` file
   - Paste it in the editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see "Success. No rows returned"

7. Enable Google OAuth (Detailed Steps):
   
   **A. Get Callback URL from Supabase:**
   - Go to Supabase Dashboard → Authentication → Providers → Google
   - Copy the "Callback URL" (it looks like `https://rikocvsumwdceuojzclo.supabase.co/auth/v1/callback`)
   - Keep this tab open.

   **B. Configure Google Cloud Console:**
   1. Go to [Google Cloud Console](https://console.cloud.google.com)
   2. Create a **New Project** (name it `InsightPro-Auth`)
   3. Search for **"OAuth consent screen"** in top bar
      - Select **External** → Create
      - App Name: `InsightsPro`
      - Support Email: Select yours
      - Developer Contact: Select yours
      - Click "Save and Continue" (skip scopes/test users for now)
   4. Go to **Credentials** (left sidebar)
      - Click **+ CREATE CREDENTIALS** → **OAuth client ID**
      - Application type: **Web application**
      - Name: `Supabase Auth`
      - **Authorized JavaScript origins**: Add `https://rikocvsumwdceuojzclo.supabase.co`
      - **Authorized redirect URIs**: Paste the URL you copied from Supabase (`.../auth/v1/callback`)
      - Click **Create**
   
   **C. Connect to Supabase:**
   - Copy the **Client ID** and **Client Secret** from Google
   - Go back to Supabase Dashboard → Authentication → Providers → Google
   - Paste the Client ID and Secret
   - Toggle "Enable Sign in with Google" **ON**
   - Click **Save**

### Step 3: Get Gemini API Key

1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click "Create API key"
3. Select "Create API key in new project"
4. Copy the API key
5. Paste it in `.env.local` → `GOOGLE_AI_API_KEY`

### Step 4: Install Dependencies & Run

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you should see the landing page!

### Step 5: Test Authentication

1. Click "Get Started" or "Sign up"
2. Enter your email, name, and password
3. Click "Create account"
4. You should be redirected to `/dashboard`
5. ✅ Success! Your auth is working!

---

## 📊 Files Created

### Configuration
- `.env.local.example` - Environment variables template
- `supabase_schema.sql` - Database schema to run in Supabase

### Supabase Integration
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/middleware.ts` - Auth session management
- `src/middleware.ts` - Route protection

### AI Integration
- `src/lib/ai/gemini.ts` - Gemini API wrapper

### Pages
- `src/app/page.tsx` - Landing page (updated)
- `src/app/login/page.tsx` - Login page
- `src/app/signup/page.tsx` - Signup page
- `src/app/auth/callback/route.ts` - OAuth callback handler

---

## 🧪 Testing Your Setup

### 1. Test Signup Flow
```bash
# Open browser to http://localhost:3000
# Click "Sign up"
# Fill form and submit
# Should redirect to /dashboard
```

### 2. Test Login Flow
```bash
# Go to /login
# Enter credentials
# Should redirect to /dashboard
```

### 3. Test Protected Routes
```bash
# While logged out, try to access /dashboard
# Should redirect to /login
```

### 4. Verify Database
```bash
# In Supabase dashboard:
# Go to "Table Editor"
# You should see: workspaces, data_sources, data_rows, ai_conversations, ai_messages
# Click "workspaces" - you should see your workspace created automatically
```

---

## 🔧 Troubleshooting

### "Invalid API key" error
- Check that you copied the correct Supabase keys
- Make sure there are no spaces before/after the keys
- Restart the dev server: `npm run dev`

### "Failed to fetch" error on signup
- Check browser console for errors
- Ensure Supabase project is fully created (wait 2-3 minutes)
- Verify your `.env.local` has all required variables

### Google OAuth not working
- For MVP, skip Google OAuth config (use email/password)
- We'll set it up properly before launch

### Can't see tables in Supabase
- Make sure you ran the entire `supabase_schema.sql` script
- Check for errors in SQL Editor
- Try running it again (it's safe to re-run)

---

## 🎯 Next Steps

Now that auth is working, we'll build:

**Day 3-4**: CSV Upload + Data Preview
**Day 5-6**: Charts & Dashboards
**Day 8-9**: AI Chat Interface

Run `npm run dev` and let's continue building! 🚀

---

## 💡 Pro Tips

1. **Keep Supabase dashboard open** - You'll use it often to check data
2. **Use Supabase Table Editor** - Easiest way to view/edit data
3. **Check Logs** - Supabase Logs show all queries and errors
4. **Test on mobile** - Open on your phone: `http://your-ip:3000`

## 🆘 Need Help?

If you get stuck, check:
1. Browser console (F12) for errors
2. Terminal for server errors
3. Supabase Logs for database errors

Everything ready? Let's build the next features! 🔥
