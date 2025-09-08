# ⚡ Quick Deploy Checklist for Access Sentinel

## Pre-Deployment Setup ✅

### 1. Supabase Project
- [ ] Create Supabase project
- [ ] Note Project URL: `https://[project-id].supabase.co`
- [ ] Note Anon Key from Settings > API
- [ ] Note Service Role Key (keep secret!)

### 2. External API Keys
- [ ] Get Google Gemini API key from [AI Studio](https://aistudio.google.com)
- [ ] Get PayPal Client ID/Secret from [PayPal Developer](https://developer.paypal.com)

## Database Setup ✅

### 3. Run Database Migration
```sql
-- Copy and run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
```
- [ ] Tables created: users, subscriptions, usage_logs, referrals, scan_results
- [ ] RLS policies enabled

## Edge Functions Deployment ✅

### 4. Deploy Functions
```bash
# Install Supabase CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref [your-project-id]

# Deploy all functions
supabase functions deploy auth
supabase functions deploy usage  
supabase functions deploy payments
supabase functions deploy ai-analysis
```

### 5. Set Function Secrets
```bash
supabase secrets set GEMINI_API_KEY=your_key_here
supabase secrets set PAYPAL_CLIENT_ID=your_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_secret
```

## Frontend Deployment ✅

### 6. Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Vercel Deployment
- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add environment variables in Vercel settings
- [ ] Deploy project

### 8. Domain Configuration
- [ ] Add access-sentinel.com in Vercel Domains
- [ ] Add www.access-sentinel.com in Vercel Domains
- [ ] Update DNS records:
  - A Record: @ → 76.76.19.61
  - CNAME: www → cname.vercel-dns.com

## Testing ✅

### 9. Verify Deployment
- [ ] Visit https://access-sentinel.com
- [ ] Test user registration
- [ ] Test extension download
- [ ] Test dashboard functionality
- [ ] Verify payment flow (use PayPal sandbox)

### 10. Function Testing
Test these endpoints:
- [ ] `POST /functions/v1/auth` (user registration)
- [ ] `POST /functions/v1/usage` (usage tracking)
- [ ] `POST /functions/v1/payments` (subscription)
- [ ] `POST /functions/v1/ai-analysis` (AI scanning)

## Post-Deployment ✅

### 11. Monitoring Setup
- [ ] Enable Supabase monitoring
- [ ] Set up Vercel analytics
- [ ] Configure error tracking

### 12. Security Review
- [ ] Verify RLS policies
- [ ] Check CORS configuration
- [ ] Review API key security
- [ ] Test rate limiting

## Commands Reference

### Supabase CLI Commands
```bash
# Check status
supabase status

# View logs
supabase functions logs auth
supabase functions logs usage

# Update function
supabase functions deploy auth --no-verify-jwt

# List secrets
supabase secrets list
```

### Vercel CLI Commands
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Check deployment
vercel ls
```

## Environment URLs

### Development
- Frontend: http://localhost:5173
- Supabase: https://[project-id].supabase.co

### Production  
- Frontend: https://access-sentinel.com
- API: https://[project-id].supabase.co/functions/v1/

## Support Contacts

- Supabase Support: [support.supabase.com](https://support.supabase.com)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- PayPal Developer: [developer.paypal.com/support](https://developer.paypal.com/support)

---

**Total Deployment Time: ~30-45 minutes** ⏱️

Once complete, your Access Sentinel app will be live at access-sentinel.com! 🚀