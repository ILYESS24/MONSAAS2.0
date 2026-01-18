/**
 * Route Configuration
 * 
 * Centralized route definitions with metadata.
 */

import { lazy, ComponentType } from 'react';
import { ROUTES } from '@/constants';

// =============================================================================
// LAZY LOADED COMPONENTS
// =============================================================================

// Eager load critical components
import Home from '@/components/home';

// Lazy load non-critical pages
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const Legal = lazy(() => import('@/pages/Legal'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const MonitoringDashboard = lazy(() => import('@/pages/MonitoringDashboard'));
const WorkflowBuilder = lazy(() => import('@/pages/WorkflowBuilder'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const Contact = lazy(() => import('@/pages/Contact'));
const SignIn = lazy(() => import('@/pages/SignIn'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const CodeEditor = lazy(() => import('@/pages/CodeEditor'));
const IntelligentCanvas = lazy(() => import('@/pages/IntelligentCanvas'));
const AppBuilder = lazy(() => import('@/pages/AppBuilder'));
const TextEditor = lazy(() => import('@/pages/TextEditor'));
const AgentAI = lazy(() => import('@/pages/AgentAI'));
const AurionChat = lazy(() => import('@/pages/AurionChat'));

// =============================================================================
// TYPES
// =============================================================================

/**
 * Layout types for route configuration
 */
export const LAYOUT_TYPES = {
  MAIN: 'main',
  DASHBOARD: 'dashboard',
  AUTH: 'auth',
  TOOL: 'tool',
  NONE: 'none',
} as const;

export type LayoutType = typeof LAYOUT_TYPES[keyof typeof LAYOUT_TYPES];

export interface RouteConfig {
  path: string;
  component: ComponentType;
  exact?: boolean;
  protected?: boolean;
  layout?: LayoutType;
  meta?: {
    title?: string;
    description?: string;
  };
}

// =============================================================================
// PUBLIC ROUTES
// =============================================================================

export const publicRoutes: RouteConfig[] = [
  {
    path: ROUTES.HOME,
    component: Home,
    layout: LAYOUT_TYPES.NONE,
    meta: { title: 'Aurion Studio - AI-Powered Development Platform' },
  },
  {
    path: ROUTES.ABOUT,
    component: About,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'About Us - Aurion Studio' },
  },
  {
    path: ROUTES.BLOG,
    component: Blog,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Blog - Aurion Studio' },
  },
  {
    path: ROUTES.CONTACT,
    component: Contact,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Contact - Aurion Studio' },
  },
  {
    path: ROUTES.PRIVACY,
    component: Privacy,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Privacy Policy - Aurion Studio' },
  },
  {
    path: ROUTES.TERMS,
    component: Terms,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Terms of Service - Aurion Studio' },
  },
  {
    path: ROUTES.COOKIES,
    component: Cookies,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Cookie Policy - Aurion Studio' },
  },
  {
    path: ROUTES.LEGAL,
    component: Legal,
    layout: LAYOUT_TYPES.MAIN,
    meta: { title: 'Legal - Aurion Studio' },
  },
];

// =============================================================================
// AUTH ROUTES
// =============================================================================

export const authRoutes: RouteConfig[] = [
  {
    path: `${ROUTES.SIGN_IN}/*`,
    component: SignIn,
    layout: LAYOUT_TYPES.AUTH,
    meta: { title: 'Sign In - Aurion Studio' },
  },
  {
    path: `${ROUTES.SIGN_UP}/*`,
    component: SignUp,
    layout: LAYOUT_TYPES.AUTH,
    meta: { title: 'Sign Up - Aurion Studio' },
  },
];

// =============================================================================
// PROTECTED ROUTES
// =============================================================================

export const protectedRoutes: RouteConfig[] = [
  {
    path: ROUTES.DASHBOARD,
    component: Dashboard,
    protected: true,
    layout: LAYOUT_TYPES.DASHBOARD,
    meta: { title: 'Dashboard - Aurion Studio' },
  },
  {
    path: `${ROUTES.DASHBOARD}/*`,
    component: Dashboard,
    protected: true,
    layout: LAYOUT_TYPES.DASHBOARD,
    meta: { title: 'Dashboard - Aurion Studio' },
  },
  {
    path: ROUTES.MONITORING,
    component: MonitoringDashboard,
    protected: true,
    layout: LAYOUT_TYPES.NONE,
    meta: { title: 'Monitoring Dashboard - Aurion Studio' },
  },
  {
    path: ROUTES.WORKFLOWS,
    component: WorkflowBuilder,
    protected: true,
    layout: LAYOUT_TYPES.NONE,
    meta: { title: 'Workflow Automation - Aurion Studio' },
  },
  {
    path: ROUTES.CODE_EDITOR,
    component: CodeEditor,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'Code Editor - Aurion Studio' },
  },
  {
    path: ROUTES.INTELLIGENT_CANVAS,
    component: IntelligentCanvas,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'Intelligent Canvas - Aurion Studio' },
  },
  {
    path: ROUTES.APP_BUILDER,
    component: AppBuilder,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'App Builder - Aurion Studio' },
  },
  {
    path: ROUTES.TEXT_EDITOR,
    component: TextEditor,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'Text Editor - Aurion Studio' },
  },
  {
    path: ROUTES.AGENT_AI,
    component: AgentAI,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'Agent AI - Aurion Studio' },
  },
  {
    path: ROUTES.AURION_CHAT,
    component: AurionChat,
    protected: true,
    layout: LAYOUT_TYPES.TOOL,
    meta: { title: 'Aurion Chat - Aurion Studio' },
  },
];

// =============================================================================
// ALL ROUTES
// =============================================================================

export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...authRoutes,
  ...protectedRoutes,
];

export default {
  publicRoutes,
  authRoutes,
  protectedRoutes,
  allRoutes,
};
