# Cloudflare Environment Variables Setup

## Required Environment Variables

You need to set these environment variables in Cloudflare for your functions to work:

### Supabase (REQUIRED)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Authentication (REQUIRED)
```bash
JWT_SECRET=your_secure_jwt_secret_here
```

### Stripe (REQUIRED for payments)
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### AI Services (REQUIRED)
```bash
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_key
FREEPIK_API_KEY=your_freepik_api_key
```

### CORS (OPTIONAL)
```bash
ALLOWED_ORIGINS=https://aurion.app,https://www.aurion.app
```

## How to Set Environment Variables

### Option 1: Using Wrangler CLI
```bash
# Set each variable
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
# ... etc
```

### Option 2: Using wrangler.toml
Edit `wrangler.toml` and replace the placeholder values with your actual keys:

```toml
[vars]
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "your_actual_service_role_key"
JWT_SECRET = "your_secure_jwt_secret"
# ... etc
```

## Getting Your Keys

- **Supabase**: Dashboard → Settings → API
- **Stripe**: Dashboard → Developers → API Keys
- **OpenRouter**: https://openrouter.ai/keys
- **Freepik**: https://freepik.com/api
- **JWT_SECRET**: Generate a secure random string (256-bit recommended)

## After Setting Variables

Redeploy your application:
```bash
npm run deploy:cloudflare
```
