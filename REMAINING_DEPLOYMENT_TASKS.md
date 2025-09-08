# Remaining Deployment Tasks for Access Sentinel

Since your Supabase backend is already deployed and you've purchased access-sentinel.com on GoDaddy, here are the remaining tasks:

## 1. Deploy Frontend to Vercel (5 minutes)
- [ ] Push your code to GitHub repository
- [ ] Connect GitHub repo to Vercel
- [ ] Deploy with environment variables from Supabase
- [ ] Note the Vercel deployment URL (e.g., access-sentinel.vercel.app)

## 2. Configure GoDaddy DNS (10 minutes)
**In GoDaddy DNS Management:**
- [ ] Add CNAME record: `www` → `cname.vercel-dns.com`
- [ ] Add A record: `@` → `76.76.19.19` (Vercel's IP)
- [ ] Add A record: `@` → `76.76.21.21` (Vercel's backup IP)

## 3. Configure Custom Domain in Vercel (5 minutes)
**In Vercel Dashboard:**
- [ ] Go to Project Settings → Domains
- [ ] Add `access-sentinel.com`
- [ ] Add `www.access-sentinel.com`
- [ ] Wait for SSL certificate generation (5-10 minutes)

## 4. Update Environment Variables (2 minutes)
**In Vercel Environment Variables:**
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=https://access-sentinel.com
```

## 5. Test Deployment (5 minutes)
- [ ] Visit https://access-sentinel.com
- [ ] Test user registration/login
- [ ] Test Chrome extension connection
- [ ] Verify payment flow works
- [ ] Check all pages load correctly

## 6. Final Configuration (5 minutes)
**Update Supabase Auth Settings:**
- [ ] Add `https://access-sentinel.com` to allowed redirect URLs
- [ ] Add `https://www.access-sentinel.com` to allowed redirect URLs

**Update PayPal Settings:**
- [ ] Add production domain to PayPal app settings
- [ ] Switch to live PayPal credentials if ready

## Total Time: ~30 minutes

## Quick Commands for Vercel Deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel --prod

# Add domain
vercel domains add access-sentinel.com
```

## Troubleshooting:
- **DNS not propagating?** Wait 24-48 hours or use CloudFlare for faster DNS
- **SSL issues?** Ensure both www and non-www domains are added to Vercel
- **404 errors?** Check vercel.json rewrites configuration
- **CORS errors?** Verify Supabase URL in environment variables

Your backend is ready - just need to connect the frontend and domain!