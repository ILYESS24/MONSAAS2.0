# Aurion Studio - Complete SaaS Platform

A professional SaaS application with Clerk authentication, real-time Supabase dashboard, and 5 integrated development tools.

## 🚀 Features

- ✅ **Secure Authentication** - Clerk-based authentication with protected routes
- ✅ **Real-time Dashboard** - Live statistics and activity feed powered by Supabase
- ✅ **5 Integrated Tools**:
  - Code Editor - Full-featured code editing environment
  - App Builder - Visual application builder
  - Agent AI - AI-powered development assistant
  - Aurion Chat - Real-time communication
  - Text Editor - Rich text editing capabilities
- ✅ **Modern UI** - Dark theme with animations using Framer Motion
- ✅ **Production-Ready** - Deployed on Cloudflare Pages with security headers

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/ILYESS24/MONSAAS.git
cd MONSAAS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Clerk credentials

# Start development server
npm run dev
```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration (Required for database features)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication (Required for auth features)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Optional Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

## 📚 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run deploy       # Deploy to Cloudflare Pages
```

## 🏗️ Architecture

This project follows a **feature-based modular architecture**:

```
src/
├── components/     # Reusable UI components
├── config/         # Application configuration
├── contexts/       # React Context providers
├── hooks/          # Custom React hooks
├── layouts/        # Page layouts
├── lib/            # Utility libraries
├── pages/          # Page components
├── providers/      # Application providers
├── router/         # Routing configuration
├── services/       # Business logic services
└── types/          # TypeScript definitions
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## 🔒 Security

- Content Security Policy (CSP) headers configured
- Secure iframe handling with sandbox attributes
- Protected routes with authentication
- Environment variables for sensitive data

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for the complete security audit.

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

## 🚢 Deployment

The application is configured for Cloudflare Pages deployment:

```bash
# Login to Cloudflare
npm run cf:login

# Deploy to production
npm run deploy

# Deploy to preview
npm run deploy:preview
```

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
