/**
 * Application Constants
 * 
 * Static values that don't change based on environment.
 * For environment-specific configuration, use src/config/index.ts
 */

/**
 * Route paths - centralized routing constants
 */
export const ROUTES = {
  // Public routes
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COOKIES: '/cookies',
  LEGAL: '/legal',
  
  // Auth routes
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  
  // Protected routes
  DASHBOARD: '/dashboard',
  CODE_EDITOR: '/code-editor',
  INTELLIGENT_CANVAS: '/intelligent-canvas',
  APP_BUILDER: '/app-builder',
  TEXT_EDITOR: '/text-editor',
  AGENT_AI: '/agent-ai',
  AURION_CHAT: '/aurion-chat',
} as const;

/**
 * External tool URLs
 */
export const EXTERNAL_TOOLS = {
  CODE_EDITOR: {
    name: 'Code Editor',
    description: 'Advanced code editor with AI assistance',
    url: 'https://bolt.new',
    icon: 'Code',
  },
  INTELLIGENT_CANVAS: {
    name: 'Intelligent Canvas',
    description: 'AI-powered design canvas',
    url: 'https://tldraw.com',
    icon: 'Palette',
  },
  APP_BUILDER: {
    name: 'App Builder',
    description: 'Visual application builder',
    url: 'https://bolt.new',
    icon: 'Boxes',
  },
  TEXT_EDITOR: {
    name: 'Text Editor',
    description: 'Rich text editor with collaboration',
    url: 'https://bolt.new',
    icon: 'FileText',
  },
  AGENT_AI: {
    name: 'Agent AI',
    description: 'AI agent for automation tasks',
    url: 'https://bolt.new',
    icon: 'Bot',
  },
  AURION_CHAT: {
    name: 'Aurion Chat',
    description: 'AI-powered chat assistant',
    url: 'https://bolt.new',
    icon: 'MessageSquare',
  },
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'aurion-theme',
  USER_PREFERENCES: 'aurion-user-prefs',
  RECENT_PROJECTS: 'aurion-recent-projects',
  NOTIFICATIONS_READ: 'aurion-notifications-read',
  SIDEBAR_COLLAPSED: 'aurion-sidebar-collapsed',
} as const;

/**
 * Event names for analytics
 */
export const ANALYTICS_EVENTS = {
  // Page events
  PAGE_VIEW: 'page_view',
  
  // User events
  USER_SIGN_IN: 'user_sign_in',
  USER_SIGN_UP: 'user_sign_up',
  USER_SIGN_OUT: 'user_sign_out',
  
  // Tool events
  TOOL_OPENED: 'tool_opened',
  TOOL_CLOSED: 'tool_closed',
  
  // Dashboard events
  DASHBOARD_VIEWED: 'dashboard_viewed',
  QUICK_ACTION_CLICKED: 'quick_action_clicked',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

/**
 * Animation durations (in ms)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
  OVERLAY: 1090,
} as const;

export default {
  ROUTES,
  EXTERNAL_TOOLS,
  HTTP_STATUS,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  BREAKPOINTS,
  ANIMATION_DURATIONS,
  Z_INDEX,
};
