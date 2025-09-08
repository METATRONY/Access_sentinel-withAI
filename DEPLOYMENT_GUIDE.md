# Access Sentinel Deployment Guide

## Prerequisites
- Supabase account
- Domain: access-sentinel.com
- Google Gemini API key
- PayPal developer account

## 1. Supabase Setup

### Create Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID
```

### Deploy Database Schema
```bash
# Run migrations
supabase db push

# Or manually run the SQL in Supabase dashboard
```

### Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy auth
supabase functions deploy usage
supabase functions deploy payments
supabase functions deploy ai-analysis

# Set environment variables
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set PAYPAL_CLIENT_ID=your_paypal_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## 2. Domain Configuration

### Frontend Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel/Netlify with custom domain
# Or use any static hosting service
```

### DNS Configuration
Point your domain to your hosting provider:
- A record: @ → hosting_ip_address
- CNAME: www → access-sentinel.com

## 3. Environment Variables

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Edge Functions
```
GEMINI_API_KEY=your_google_gemini_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

## 4. Testing Deployment

### Test API Endpoints
```bash
# Test auth
curl -X POST https://your-project.supabase.co/functions/v1/auth \
  -H "Content-Type: application/json" \
  -d '{"method":"register","body":{"email":"test@example.com","password":"password123"}}'

# Test usage tracking
curl -X POST https://your-project.supabase.co/functions/v1/usage \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature_used":"image_check","tokens_used":100}'
```

## 5. Chrome Extension Setup

Update manifest.json with your domain:
```json
{
  "host_permissions": [
    "https://access-sentinel.com/*",
    "https://your-project.supabase.co/*"
  ]
}
```

## 6. Monitoring & Analytics

- Enable Supabase Analytics
- Set up error tracking (Sentry)
- Monitor API usage and costs
- Set up alerts for quota limits