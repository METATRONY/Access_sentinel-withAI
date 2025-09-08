# 🚀 Step-by-Step Deployment Guide for Access Sentinel

## Prerequisites
- GitHub account
- Supabase account (free tier is fine to start)
- Vercel account
- Domain access-sentinel.com (already purchased)

## Step 1: Setup Supabase Project

### 1.1 Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Name: "Access Sentinel"
4. Database Password: Generate a strong password (save it!)
5. Region: Choose closest to your users
6. Click "Create new project"

### 1.2 Get Project Details
After project creation, note these values:
- Project URL: `https://[your-project-id].supabase.co`
- Anon Key: Found in Settings > API
- Service Role Key: Found in Settings > API (keep secret!)

## Step 2: Deploy Database Schema

### 2.1 Run Migration
1. In Supabase Dashboard, go to "SQL Editor"
2. Click "New Query"
3. Copy content from `supabase/migrations/001_initial_schema.sql`
4. Paste and click "Run"
5. Verify tables created in "Table Editor"

### 2.2 Verify Setup
Check these tables exist:
- users
- subscriptions  
- usage_logs
- referrals
- scan_results

## Step 3: Deploy Edge Functions

### 3.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Login and Link Project
```bash
supabase login
supabase link --project-ref [your-project-id]
```

### 3.3 Deploy Functions
```bash
supabase functions deploy auth
supabase functions deploy usage
supabase functions deploy payments
supabase functions deploy ai-analysis
```

### 3.4 Set Function Secrets
```bash
supabase secrets set GEMINI_API_KEY=your_google_gemini_key
supabase secrets set PAYPAL_CLIENT_ID=your_paypal_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## Step 4: Configure Environment Variables

### 4.1 Create .env.local
```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Step 5: Deploy to Vercel

### 5.1 Connect GitHub
1. Push your code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository

### 5.2 Configure Build Settings
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### 5.3 Add Environment Variables
In Vercel project settings, add:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### 5.4 Deploy
Click "Deploy" - Vercel will build and deploy your app

## Step 6: Configure Custom Domain

### 6.1 Add Domain in Vercel
1. Go to your Vercel project
2. Settings > Domains
3. Add "access-sentinel.com"
4. Add "www.access-sentinel.com"

### 6.2 Update DNS Records
In your domain registrar, add these DNS records:

**A Record:**
- Name: @
- Value: 76.76.19.61

**CNAME Record:**
- Name: www
- Value: cname.vercel-dns.com

### 6.3 Wait for Propagation
DNS changes can take up to 48 hours to propagate globally.

## Step 7: Test Deployment

### 7.1 Verify Functions
Test each endpoint:
- `https://[project-id].supabase.co/functions/v1/auth`
- `https://[project-id].supabase.co/functions/v1/usage`
- `https://[project-id].supabase.co/functions/v1/payments`
- `https://[project-id].supabase.co/functions/v1/ai-analysis`

### 7.2 Test Website
1. Visit access-sentinel.com
2. Test user registration
3. Test extension download
4. Verify dashboard functionality

## Step 8: Configure Additional Services

### 8.1 Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create API key
3. Add to Supabase secrets: `GEMINI_API_KEY`

### 8.2 PayPal Integration
1. Go to [PayPal Developer](https://developer.paypal.com)
2. Create app for production
3. Get Client ID and Secret
4. Add to Supabase secrets

## Step 9: Monitor and Scale

### 9.1 Set Up Monitoring
- Enable Supabase monitoring
- Set up Vercel analytics
- Configure error tracking

### 9.2 Performance Optimization
- Enable Vercel Edge Functions
- Configure CDN caching
- Optimize database queries

## Troubleshooting

### Common Issues:
1. **Build fails**: Check environment variables
2. **Functions timeout**: Increase timeout in Supabase
3. **CORS errors**: Verify function headers
4. **Database connection**: Check RLS policies

### Support Resources:
- Supabase Documentation
- Vercel Documentation  
- GitHub Issues

## Next Steps After Deployment

1. Set up monitoring and alerts
2. Configure backup strategies
3. Plan scaling for user growth
4. Set up CI/CD pipeline
5. Add analytics and tracking

Your Access Sentinel app should now be live at access-sentinel.com! 🎉