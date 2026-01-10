# DataGenie 🧞‍♂️✨

**AI-Powered Analytics Made Magical**

Transform your raw data into actionable insights with the power of AI. DataGenie lets you upload CSV files, visualize data with beautiful charts, and chat with your data in plain English.

## 🌟 Features

### Currently Available
- ✅ **Authentication**: Secure login/signup with Supabase Auth
- ✅ **CSV Upload**: Drag & drop CSV files with instant parsing
- ✅ **Data Preview**: View uploaded data in clean tables
- ✅ **Interactive Charts**: Auto-generated bar, line, and pie charts
- ✅ **AI Chat**: Ask questions about your data in natural language
- ✅ **Smart Suggestions**: Contextual question recommendations
- ✅ **Auto-Insights**: Automatic statistical analysis and key findings

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Google Gemini (2.5-flash)
- **Charts**: Recharts
- **State**: Zustand
- **CSV Parsing**: PapaParse

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/VinaySehwag14/datagenie.git
cd datagenie

AI-powered Business Intelligence platform for Indian small businesses. Upload your data, ask questions in plain English, get instant insights.

## ✨ What's Built (Day 1-2 Complete!)

### ✅ Authentication System
- Email/password signup & login
- Google OAuth integration ready
- Protected routes with middleware
- Automatic workspace creation on signup

### ✅ Infrastructure
- **Database**: Supabase PostgreSQL with Row Level Security
- **AI**: Google Gemini 2.0 Flash integration
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Hosting**: Ready for Vercel deployment

### ✅ Security
- Row-level security (RLS) policies
- Protected API routes
- Secure session management
- Environment variables for secrets

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Google AI Studio API key (Gemini)

### Setup (5 minutes)

1. **Clone and install**
   ```bash
   cd insightspro
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials (see SETUP.md)
   ```

3. **Set up Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Run `supabase_schema.sql` in SQL Editor
   - Copy credentials to `.env.local`

4. **Get Gemini API key**
   - Visit [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - Create API key
   - Add to `.env.local`

5. **Run dev server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

📖 **Detailed setup guide**: See [SETUP.md](./SETUP.md)

## 📁 Project Structure

```
insightspro/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── page.tsx           # Landing page
│   │   ├── login/page.tsx     # Login page
│   │   ├── signup/page.tsx    # Signup page
│   │   ├── dashboard/         # Dashboard (protected)
│   │   └── auth/callback/     # OAuth callback
│   ├── lib/
│   │   ├── supabase/          # Supabase clients
│   │   └── ai/gemini.ts       # AI integration
│   └── middleware.ts          # Auth middleware
├── supabase_schema.sql        # Database schema
├── SETUP.md                # Setup instructions
└── .env.local.example         # Environment template
```

## 🎯 Roadmap

### Week 1 (Days 1-7)
- [x] **Day 1-2**: Project setup + Authentication ✅
- [ ] **Day 3-4**: CSV upload + data preview
- [ ] **Day 5-6**: Charts & dashboards
- [ ] **Day 7**: Testing & refinement

### Week 2 (Days 8-14)
- [ ] **Day 8-9**: AI chat interface
- [ ] **Day 10**: Auto-insights
- [ ] **Day 11**: Razorpay payments
- [ ] **Day 12-13**: Polish & UX
- [ ] **Day 14**: Beta launch

## 🛠️ Tech Stack

| Category | Technology | Free Tier |
|----------|-----------|-----------|
| **Framework** | Next.js 15 | Unlimited |
| **Database** | Supabase PostgreSQL | 500MB |
| **AI** | Google Gemini 2.0 | 1,500 req/day |
| **Auth** | Supabase Auth | Unlimited |
| **Hosting** | Vercel | Unlimited |
| **Payments** | Razorpay | 2% per txn |
| **Charts** | Recharts | Free |

**Total monthly cost**: ₹0 🎉

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Test Authentication
1. Visit [http://localhost:3000/signup](http://localhost:3000/signup)
2. Create account with email/password
3. Should redirect to `/dashboard`
4. Check Supabase Table Editor → `workspaces` table
5. You should see your workspace!

## 📦 Dependencies

### Core
- `next` - React framework
- `react` - UI library
- `typescript` - Type safety

### Database & Auth
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side rendering

### AI
- `@google/generative-ai` - Gemini API

### Data & Charts
- `papaparse` - CSV parsing
- `recharts` - Charts
- `date-fns` - Date utilities

### Forms & State
- `react-hook-form` - Forms
- `zod` - Validation
- `zustand` - State management

### UI
- `tailwindcss` - Styling
- `lucide-react` - Icons
- `framer-motion` - Animations

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repo
   - Add environment variables (from `.env.local`)
   - Click "Deploy"

3. **Update Supabase**
   - In Supabase → Authentication → URL Configuration
   - Add your Vercel URL to "Redirect URLs"

## 🔐 Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key
GOOGLE_AI_API_KEY=                 # Gemini API key
NEXT_PUBLIC_APP_URL=               # http://localhost:3000
```

Optional (for payments):
```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=       # Razorpay key
RAZORPAY_KEY_SECRET=               # Razorpay secret
```

## 📊 Database Schema

Tables created:
- `workspaces` - User workspaces
- `data_sources` - Uploaded files
- `data_rows` - Actual data (JSONB)
- `ai_conversations` - Chat history
- `ai_messages` - Individual messages

All tables have:
- Row Level Security (RLS)
- Automatic timestamps
- Foreign key constraints
- Indexed columns

## 🆘 Troubleshooting

### Authentication not working
- Check `.env.local` has correct Supabase keys
- Restart dev server: `npm run dev`
- Clear browser cookies

### Database errors
- Verify `supabase_schema.sql` ran successfully
- Check Supabase Logs for errors
- Ensure RLS policies are enabled

### AI not responding
- Verify `GOOGLE_AI_API_KEY` is set
- Check Gemini API quota (1,500 free/day)
- Try a different prompt

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Contributing

This is a personal project, but feedback welcome! Open an issue or PR.

## 👨‍💻 Author

Built with ❤️ by Vinay Sehwag

## 🎯 Next Steps

Now that authentication works, follow the [2-week MVP roadmap](/.gemini/antigravity/brain/4df89851-594c-469c-943b-43bf5042c527/mvp_roadmap.md) to build:
1. CSV upload + preview
2. Charts & visualizations
3. AI chat interface
4. Payments with Razorpay

---

**Status**: 🟢 Day 1-2 Complete | Next: CSV Upload
