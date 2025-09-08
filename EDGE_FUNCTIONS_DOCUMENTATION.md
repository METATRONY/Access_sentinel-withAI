# Access Sentinel Edge Functions Documentation

## Overview
Edge functions provide serverless API endpoints for the Access Sentinel Chrome extension. All functions run on Supabase Edge Runtime (Deno) and include CORS handling for browser extensions.

## Authentication Function (`/functions/auth`)

### Purpose
Handles user registration and authentication for the Chrome extension.

### Endpoints

#### POST /auth (method: "register")
```json
{
  "method": "register",
  "body": {
    "email": "user@example.com",
    "password": "securepassword"
  }
}
```

**Response:**
```json
{
  "data": {
    "user": { "id": "uuid", "email": "user@example.com" },
    "session": { "access_token": "jwt_token" }
  }
}
```

#### POST /auth (method: "login")
```json
{
  "method": "login",
  "body": {
    "email": "user@example.com", 
    "password": "securepassword"
  }
}
```

### Security Features
- Automatic user profile creation
- Free subscription initialization
- Unique referral code generation
- JWT token authentication

## Usage Tracking Function (`/functions/usage`)

### Purpose
Enforces quota limits and logs API usage for billing and analytics.

### Request
```json
{
  "feature_used": "image_check",
  "tokens_used": 150
}
```

**Headers Required:**
- `Authorization: Bearer JWT_TOKEN`

### Quota Logic
- **Free Tier**: 10 queries/day, 100K tokens/month
- **Premium Tier**: 1000 queries/day, 1M tokens/month

### Response Codes
- `200`: Usage logged successfully
- `429`: Daily/monthly limit exceeded
- `401`: Invalid authentication

### Database Operations
1. Validates JWT token
2. Checks current daily usage
3. Verifies subscription tier
4. Logs usage if within limits

## Payment Processing Function (`/functions/payments`)

### Purpose
Manages subscription upgrades and payment webhook handling.

### Create Checkout Session
```json
{
  "method": "create-checkout"
}
```

**Response:**
```json
{
  "checkout_url": "https://paypal.com/checkout/..."
}
```

### Webhook Handler
```json
{
  "method": "webhook",
  "user_id": "uuid",
  "subscription_id": "paypal_sub_id",
  "status": "completed"
}
```

### Payment Flow
1. User requests upgrade
2. PayPal checkout session created
3. User completes payment
4. PayPal sends webhook
5. Subscription upgraded to premium

## AI Analysis Function (`/functions/ai-analysis`)

### Purpose
Processes content through Google Gemini API for authenticity checking.

### Request
```json
{
  "content": "text or image data",
  "type": "text" // or "image"
}
```

### Google Gemini Integration
```javascript
const geminiResponse = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
  {
    method: 'POST',
    body: JSON.stringify({
      contents: [{
        parts: [{ text: analysisPrompt }]
      }]
    })
  }
)
```

### Response
```json
{
  "analysis": "Detailed AI analysis result",
  "confidence_score": 85.7
}
```

### Features
- Content type detection (text/image)
- AI-powered authenticity analysis
- Confidence scoring
- Result storage for user history

## Error Handling

All functions implement consistent error handling:

```json
{
  "error": "Descriptive error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing JWT token
- `QUOTA_EXCEEDED`: Usage limits reached
- `INVALID_REQUEST`: Malformed request data
- `EXTERNAL_API_ERROR`: Google Gemini API failure

## CORS Configuration

All functions include CORS headers for Chrome extension compatibility:

```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

## Environment Variables

### Required Secrets
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_google_gemini_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_secret
```

### Setting Secrets
```bash
supabase secrets set GEMINI_API_KEY=your_key
supabase secrets set PAYPAL_CLIENT_ID=your_id
```

## Deployment Commands

```bash
# Deploy individual function
supabase functions deploy auth

# Deploy all functions
supabase functions deploy

# View function logs
supabase functions logs auth
```

## Rate Limiting & Performance

- Functions auto-scale based on demand
- Built-in rate limiting per user
- Cached authentication tokens
- Optimized database queries with indexes

## Monitoring

- Function execution logs in Supabase dashboard
- Error tracking and alerting
- Performance metrics and response times
- Usage analytics for business insights