# 🌐 Domain Setup Guide for access-sentinel.com

## Overview
This guide helps you configure your access-sentinel.com domain to work with your deployed Access Sentinel application on Vercel.

## Step 1: Vercel Domain Configuration

### 1.1 Add Domain to Vercel Project
1. Go to your Vercel dashboard
2. Select your Access Sentinel project
3. Navigate to Settings > Domains
4. Click "Add Domain"
5. Enter: `access-sentinel.com`
6. Click "Add"
7. Repeat for: `www.access-sentinel.com`

### 1.2 Verify Domain Ownership
Vercel will provide DNS records to verify ownership. Add these to your domain registrar.

## Step 2: DNS Configuration

### 2.1 Required DNS Records

**For Root Domain (access-sentinel.com):**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.61
TTL: 3600
```

**For WWW Subdomain:**
```
Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 2.2 Optional DNS Records

**For Email (if needed):**
```
Type: MX
Name: @
Value: mail.access-sentinel.com
Priority: 10
```

**For Subdomains:**
```
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

## Step 3: Domain Registrar Setup

### 3.1 Common Registrars

#### GoDaddy
1. Login to GoDaddy account
2. Go to "My Products" > "DNS"
3. Select access-sentinel.com
4. Add/modify records as specified above

#### Namecheap
1. Login to Namecheap account  
2. Go to "Domain List"
3. Click "Manage" next to access-sentinel.com
4. Go to "Advanced DNS" tab
5. Add/modify records

#### Cloudflare
1. Login to Cloudflare dashboard
2. Select access-sentinel.com domain
3. Go to "DNS" tab
4. Add/modify records
5. Ensure proxy status is appropriate

#### Google Domains
1. Login to Google Domains
2. Select access-sentinel.com
3. Go to "DNS" tab
4. Add/modify records in "Custom records"

### 3.2 DNS Propagation
- Changes can take 24-48 hours to propagate globally
- Use tools like [whatsmydns.net](https://whatsmydns.net) to check propagation
- Some regions may see changes faster than others

## Step 4: SSL Certificate Setup

### 4.1 Automatic SSL (Recommended)
Vercel automatically provides SSL certificates for custom domains:
- Certificate is issued within minutes of DNS verification
- Auto-renewal every 90 days
- Supports both root and www domains

### 4.2 Verify SSL
1. Wait for DNS propagation (usually 5-30 minutes)
2. Visit https://access-sentinel.com
3. Check for green padlock in browser
4. Verify certificate details

## Step 5: Redirect Configuration

### 5.1 WWW to Non-WWW (Recommended)
Configure www.access-sentinel.com to redirect to access-sentinel.com:

In `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://access-sentinel.com/$1",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "www.access-sentinel.com"
        }
      ]
    }
  ]
}
```

### 5.2 HTTP to HTTPS
Vercel automatically redirects HTTP to HTTPS for custom domains.

## Step 6: Testing and Verification

### 6.1 DNS Testing Tools
```bash
# Check DNS resolution
nslookup access-sentinel.com
dig access-sentinel.com

# Check from different locations
https://whatsmydns.net
https://dnschecker.org
```

### 6.2 Website Testing
1. Visit https://access-sentinel.com
2. Verify all pages load correctly
3. Test user registration/login
4. Check extension download links
5. Verify payment flows

### 6.3 Performance Testing
- Use [PageSpeed Insights](https://pagespeed.web.dev)
- Test from different geographic locations
- Verify CDN performance

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring
- Configure uptime monitoring (UptimeRobot, Pingdom)
- Set up SSL certificate expiry alerts
- Monitor DNS resolution globally

### 7.2 Analytics Setup
Add analytics to track domain performance:
- Google Analytics
- Vercel Analytics  
- Custom tracking pixels

## Troubleshooting

### Common Issues

#### DNS Not Resolving
- Check DNS records are correct
- Wait for propagation (up to 48 hours)
- Clear local DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (macOS)

#### SSL Certificate Issues
- Ensure DNS is fully propagated
- Check Vercel domain settings
- Contact Vercel support if certificate doesn't issue

#### Redirect Loops
- Check Vercel redirect configuration
- Verify domain registrar forwarding settings
- Clear browser cache

#### Site Not Loading
- Verify Vercel deployment is successful
- Check environment variables are set
- Review Vercel function logs

### Support Resources
- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- DNS Propagation Checker: [whatsmydns.net](https://whatsmydns.net)
- SSL Test: [ssllabs.com/ssltest](https://ssllabs.com/ssltest)

## Security Considerations

### 7.3 Additional Security
- Enable HSTS headers
- Configure CSP headers
- Set up rate limiting
- Monitor for suspicious activity

Your access-sentinel.com domain should now be fully configured and secure! 🔒