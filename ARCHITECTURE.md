# Architecture Documentation

## Overview

Aurion Studio follows a **feature-based modular architecture** with clear separation of concerns, designed for scalability, maintainability, and testability.

## Directory Structure

```
src/
├── apps/                # 🆕 Micro-frontend applications
│   └── index.ts        # App registry and event bus
│
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
│   ├── queryClient.ts  # 🆕 React Query configuration
│   └── ...
│
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── SignIn.tsx
│   └── ...
│
├── providers/          # Application providers
│   └── AppProviders.tsx # Combined providers (includes React Query)
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
├── store/              # 🆕 Zustand state management
│   └── index.ts        # Global stores (App, User, Dashboard, Notifications)
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

### 2. State Management (store/, contexts/, hooks/)

- **Zustand Stores**: Global state with persistence and devtools
  - `useAppStore`: Theme, sidebar, loading states
  - `useUserStore`: User authentication state
  - `useDashboardStore`: Dashboard data and statistics
  - `useNotificationStore`: Notification management
- **Contexts**: React Context for provider-based state
- **Hooks**: Encapsulated state logic and side effects

### 3. Data Fetching (lib/queryClient.ts)

- **React Query**: Server state management
  - Automatic caching (5 min stale, 30 min cache)
  - Background refetching
  - Retry with exponential backoff
  - Query key management via `queryKeys` object

### 4. Service Layer (services/)

- **API Services**: Data fetching and manipulation
- **Auth Service**: Authentication operations
- **Analytics Service**: Event tracking

### 5. Utility Layer (lib/)

- **API Client**: HTTP request handling
- **Logger**: Centralized logging
- **Validation**: Form and data validation

### 6. Configuration Layer (config/, constants/)

- **Config**: Environment-specific settings
- **Constants**: Static values and enums

### 7. Micro-Frontend Layer (apps/)

- **App Registry**: Centralized app definitions
- **Event Bus**: Inter-app communication
- **Shared Modules**: Code sharing between apps

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

### 6. Zustand Store Pattern (NEW)
Global state with type-safe selectors:
```typescript
// Using the store
const theme = useAppStore((state) => state.theme);
const setTheme = useAppStore((state) => state.setTheme);

// With selectors for optimization
const stats = useDashboardStore(selectStats);
```

### 7. React Query Pattern (NEW)
Data fetching with automatic caching:
```typescript
// Query keys for cache management
import { queryKeys } from '@/lib/queryClient';

// Using queries
const { data, isLoading } = useQuery({
  queryKey: queryKeys.dashboard.stats(),
  queryFn: fetchDashboardStats,
});
```

### 8. Event Bus Pattern (NEW)
Inter-app communication:
```typescript
import { eventBus, AppEvents } from '@/apps';

// Subscribe to events
const unsubscribe = eventBus.on(AppEvents.DASHBOARD_REFRESH, (data) => {
  console.log('Dashboard refresh requested', data);
});

// Emit events
eventBus.emit(AppEvents.STATS_UPDATED, { totalSales: 25000 });
```

## Data Flow

```
User Action → Component → Hook/Context → Service → API
                ↓
            State Update
                ↓
        Component Re-render
```

### Enhanced Data Flow with React Query & Zustand

```
User Action
    ↓
Component → useQuery (React Query) → API → Cache
    ↓
Zustand Store (client state) ← Server Response
    ↓
Component Re-render
```

## Security Architecture

The application implements a comprehensive multi-layer security system in `src/lib/security/`.

### Security Modules

1. **Encryption (`encryption.ts`)**
   - AES-256-GCM encryption for sensitive data
   - PBKDF2 key derivation from passwords
   - Field-level encryption for database columns
   - Constant-time comparison to prevent timing attacks

2. **Input Sanitization (`sanitization.ts`)**
   - XSS prevention with HTML escaping
   - SQL injection detection and prevention
   - NoSQL injection protection
   - Path traversal attack prevention
   - Command injection blocking
   - URL sanitization

3. **Rate Limiting (`rateLimit.ts`)**
   - Sliding window rate limiter
   - Pre-configured limiters for login, API, signup
   - Automatic blocking after limit exceeded
   - Higher-order function wrapper for easy integration

4. **CSRF Protection (`csrf.ts`)**
   - Token generation and validation
   - Automatic token rotation
   - React hook (`useCsrf`) for form integration
   - Fetch wrapper for automatic header injection

5. **Multi-Factor Authentication (`mfa.ts`)**
   - TOTP (Time-based One-Time Password) compatible with Google Authenticator
   - Backup codes generation and validation
   - Device fingerprinting for trusted devices
   - Session management with MFA state tracking

6. **JWT Security (`jwt.ts`)**
   - Token parsing and validation
   - Automatic token refresh
   - Refresh token rotation with family tracking
   - Replay attack detection
   - Secure token storage

7. **Security Audit (`audit.ts`)**
   - Comprehensive event logging
   - Automatic suspicious pattern detection
   - RGPD/SOC2 compliance support
   - Export to JSON/CSV for reporting

8. **Security Headers (`headers.ts`)**
   - Content Security Policy (CSP) builder
   - Header validation and scoring
   - Security grade calculation
   - Recommended headers configuration

### Usage Example

```typescript
import {
  sanitizeInput,
  loginRateLimiter,
  useCsrf,
  totpManager,
  auditLogger,
} from '@/lib/security';

// Sanitize user input
const cleanInput = sanitizeInput(userInput, { allowHtml: false });

// Check rate limit before login
const result = loginRateLimiter.check(userEmail);
if (!result.allowed) {
  throw new Error('Too many login attempts');
}

// Generate TOTP for MFA
const secret = totpManager.generateSecret('user@example.com');

// Log security event
auditLogger.log({
  type: 'AUTH_LOGIN_SUCCESS',
  userId: user.id,
  outcome: 'success',
});
```

### Authentication Flow

1. **Primary Auth**: Clerk-based authentication
2. **MFA Verification**: TOTP or backup codes
3. **Session Management**: JWT with refresh token rotation
4. **Device Tracking**: Fingerprinting for trusted devices

### Protected Routes

Protected routes use the `ProtectedRoute` component:
```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

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

## Workflow Orchestration System

The application includes a comprehensive workflow automation system in `src/lib/workflow/`.

### Workflow Modules

1. **Types (`types.ts`)**
   - Complete type definitions for workflows, nodes, edges, executions
   - Integration types with authentication and rate limiting
   - Execution context and step tracking types

2. **Integration Registry (`integrations.ts`)**
   - 20+ native integrations (Salesforce, HubSpot, Stripe, Slack, GitHub, etc.)
   - OAuth2, API Key, JWT, and Webhook authentication support
   - Rate limiting and health monitoring
   - Webhook configuration management

3. **Workflow Engine (`engine.ts`)**
   - Node executors for all node types (action, condition, loop, delay, transform, notification)
   - Condition evaluation with multiple operators
   - Execution context management
   - Retry logic with exponential backoff
   - Event emission system

4. **Templates (`templates.ts`)**
   - Pre-built workflow templates for common automation scenarios
   - Categories: Sales, Customer Success, Development, Marketing, Operations, Support
   - Template search and filtering

5. **Store (`store.ts`)**
   - Workflow state management with React hooks
   - CRUD operations for workflows, nodes, edges
   - Execution management
   - Integration connection management

### Workflow Node Types

| Node Type | Description |
|-----------|-------------|
| `trigger` | Start point - manual, schedule, webhook, or integration event |
| `action` | Execute an integration action |
| `condition` | Branch based on conditions |
| `loop` | Iterate over arrays or repeat operations |
| `delay` | Wait for a specified time |
| `transform` | Map and transform data |
| `notification` | Send notifications (email, Slack, webhook) |
| `subworkflow` | Execute another workflow |
| `error_handler` | Handle errors gracefully |

### Usage Example

```typescript
import {
  useWorkflowStore,
  useIntegrations,
  workflowEngine,
  WORKFLOW_TEMPLATES,
} from '@/lib/workflow';

// Create a new workflow
const store = useWorkflowStore();
const workflow = store.createWorkflow({
  name: 'Lead Notification',
  trigger: { type: 'integration', config: { integrationId: 'hubspot' } },
  nodes: [...],
  edges: [...],
  // ...
});

// Execute workflow
const execution = await store.executeWorkflow(workflow.id, { leadData });

// Use templates
const template = WORKFLOW_TEMPLATES.find(t => t.id === 'lead-nurturing');
store.createWorkflow(template.workflow);
```

### Workflow Visual Builder

Access the visual workflow builder at `/workflows`:
- Create and edit workflows with drag-and-drop
- Connect integrations with OAuth2 flow
- View execution history and logs
- Use templates to get started quickly

