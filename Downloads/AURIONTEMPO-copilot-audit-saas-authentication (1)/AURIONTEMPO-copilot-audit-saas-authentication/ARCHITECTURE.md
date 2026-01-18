# Architecture Documentation

## Overview

Aurion Studio follows a **feature-based modular architecture** with clear separation of concerns, designed for scalability, maintainability, and testability.

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components (ErrorBoundary, etc.)
│   ├── fabrica/        # Feature-specific components
│   └── ui/             # Base UI components (buttons, inputs, etc.)
│
├── config/             # Application configuration
│   └── index.ts        # Centralized config (API, features, etc.)
│
├── constants/          # Static constants
│   └── index.ts        # Routes, storage keys, events, etc.
│
├── contexts/           # React Context providers
│   ├── AppContext.tsx  # Global app state
│   └── NotificationContext.tsx
│
├── hooks/              # Custom React hooks
│   ├── useLiveData.ts  # Real-time data hooks
│   ├── useAnalytics.ts # Analytics tracking
│   └── ...
│
├── layouts/            # Page layouts
│   ├── MainLayout.tsx  # Standard layout
│   ├── DashboardLayout.tsx
│   ├── AuthLayout.tsx
│   └── ToolLayout.tsx
│
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   ├── logger.ts       # Logging utility
│   ├── validation.ts   # Form validation
│   └── ...
│
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── SignIn.tsx
│   └── ...
│
├── providers/          # Application providers
│   └── AppProviders.tsx # Combined providers
│
├── router/             # Routing configuration
│   ├── routes.ts       # Route definitions
│   └── AppRouter.tsx   # Router component
│
├── services/           # Business logic services
│   ├── api.service.ts  # API service layer
│   ├── auth.service.ts # Authentication service
│   └── analytics.service.ts
│
├── types/              # TypeScript type definitions
│   └── supabase.ts     # Database types
│
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Architecture Layers

### 1. Presentation Layer (components/, pages/, layouts/)

- **UI Components**: Reusable, stateless components
- **Pages**: Container components that connect to services
- **Layouts**: Structural components that wrap pages

### 2. State Management (contexts/, hooks/)

- **Contexts**: Global state using React Context
- **Hooks**: Encapsulated state logic and side effects

### 3. Service Layer (services/)

- **API Services**: Data fetching and manipulation
- **Auth Service**: Authentication operations
- **Analytics Service**: Event tracking

### 4. Utility Layer (lib/)

- **API Client**: HTTP request handling
- **Logger**: Centralized logging
- **Validation**: Form and data validation

### 5. Configuration Layer (config/, constants/)

- **Config**: Environment-specific settings
- **Constants**: Static values and enums

## Design Patterns

### 1. Module Pattern
Each directory has an `index.ts` for clean imports:
```typescript
import { Button, Card } from '@/components/ui';
```

### 2. Provider Pattern
Contexts provide global state and utilities:
```typescript
const { showToast, showError } = useNotificationContext();
```

### 3. Service Pattern
Services encapsulate business logic:
```typescript
const projects = await projectsService.getAll();
```

### 4. Custom Hooks Pattern
Complex logic extracted into hooks:
```typescript
const { stats, isLoading } = useLiveStats();
```

### 5. Compound Component Pattern
Complex UI from composable parts:
```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Content>Content</Card.Content>
</Card>
```

## Data Flow

```
User Action → Component → Hook/Context → Service → API
                ↓
            State Update
                ↓
        Component Re-render
```

## Security Architecture

1. **Authentication**: Clerk-based with protected routes
2. **API Security**: Token-based, validated on server
3. **XSS Protection**: Content Security Policy headers
4. **CSRF Protection**: SameSite cookies
5. **Iframe Security**: Sandbox attributes, origin validation

## Performance Optimizations

1. **Code Splitting**: React.lazy() for routes
2. **Memoization**: useMemo, useCallback where appropriate
3. **Debouncing**: Search and filter operations
4. **Lazy Loading**: Images and non-critical resources

## Testing Strategy

1. **Unit Tests**: Services, utilities, hooks
2. **Integration Tests**: Component interactions
3. **E2E Tests**: Critical user flows

## Best Practices

1. **Single Responsibility**: Each module has one purpose
2. **DRY**: Shared logic in hooks and services
3. **Type Safety**: Full TypeScript coverage
4. **Error Handling**: Centralized with ErrorBoundary
5. **Logging**: Structured logging with levels
