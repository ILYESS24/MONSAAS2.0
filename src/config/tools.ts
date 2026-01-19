/**
 * Centralized Tool Configuration
 * 
 * All external tool URLs and configurations are managed here.
 * Update URLs in this single file to update them throughout the app.
 * 
 * Last Updated: 2026-01-18
 */

export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  type: 'iframe' | 'api' | 'website';
  timeout: number;
  refreshInterval: number;
  enabled: boolean;
  version: string;
  alerts: {
    sound: boolean;
    email?: string;
    webhook?: string;
  };
}

/**
 * Primary Tool URLs
 * These are the latest deployed versions of each tool
 * Updated: 2026-01-19 with production URLs
 */
export const TOOL_URLS = {
  CODE_EDITOR: 'https://eed972db.aurion-ide.pages.dev',
  APP_BUILDER: 'https://production.ai-assistant-xlv.pages.dev',
  AGENT_AI: 'https://flo-9xh2.onrender.com/',
  AURION_CHAT: 'https://canvchat-1-y73q.onrender.com/',
  TEXT_EDITOR: 'https://4e2af144.aieditor.pages.dev',
  INTELLIGENT_CANVAS: 'https://tersa-main-b5f0ey7pq-launchmateais-projects.vercel.app/canvas/',
} as const;

/**
 * Tool Configurations
 * Complete configuration for all integrated tools
 */
export const TOOLS: ToolConfig[] = [
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Full-featured code editor with AI assistance, syntax highlighting, and multi-language support',
    url: TOOL_URLS.CODE_EDITOR,
    icon: 'Code',
    type: 'iframe',
    timeout: 10000,
    refreshInterval: 60000,
    enabled: true,
    version: '2.0.0',
    alerts: { sound: true },
  },
  {
    id: 'app-builder',
    name: 'App Builder',
    description: 'Visual application builder with drag-and-drop components and AI-powered code generation',
    url: TOOL_URLS.APP_BUILDER,
    icon: 'Boxes',
    type: 'iframe',
    timeout: 10000,
    refreshInterval: 60000,
    enabled: true,
    version: '2.0.0',
    alerts: { sound: true },
  },
  {
    id: 'agent-ai',
    name: 'Agent AI',
    description: 'AI-powered development assistant for automation, code review, and intelligent suggestions',
    url: TOOL_URLS.AGENT_AI,
    icon: 'Bot',
    type: 'iframe',
    timeout: 15000,
    refreshInterval: 60000,
    enabled: true,
    version: '2.0.0',
    alerts: { sound: true },
  },
  {
    id: 'aurion-chat',
    name: 'Aurion Chat',
    description: 'Real-time AI chat assistant for development questions and code explanations',
    url: TOOL_URLS.AURION_CHAT,
    icon: 'MessageSquare',
    type: 'iframe',
    timeout: 15000,
    refreshInterval: 60000,
    enabled: true,
    version: '2.0.0',
    alerts: { sound: true },
  },
  {
    id: 'text-editor',
    name: 'Text Editor',
    description: 'Rich text editor with markdown support, collaboration features, and AI writing assistance',
    url: TOOL_URLS.TEXT_EDITOR,
    icon: 'FileText',
    type: 'iframe',
    timeout: 10000,
    refreshInterval: 60000,
    enabled: true,
    version: '2.0.0',
    alerts: { sound: true },
  },
];

/**
 * API Endpoints for monitoring
 */
export const API_ENDPOINTS: ToolConfig[] = [
  {
    id: 'github-api',
    name: 'GitHub API',
    description: 'GitHub REST API for repository operations',
    url: 'https://api.github.com',
    icon: 'Github',
    type: 'api',
    timeout: 5000,
    refreshInterval: 30000,
    enabled: true,
    version: '1.0.0',
    alerts: { sound: false },
  },
];

/**
 * Get all enabled tools
 */
export function getEnabledTools(): ToolConfig[] {
  return TOOLS.filter((tool) => tool.enabled);
}

/**
 * Get tool by ID
 */
export function getToolById(id: string): ToolConfig | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

/**
 * Get tool URL by ID
 */
export function getToolUrl(id: string): string | undefined {
  return getToolById(id)?.url;
}

/**
 * Get all tools for monitoring (including API endpoints)
 */
export function getAllMonitoredEndpoints(): ToolConfig[] {
  return [...TOOLS, ...API_ENDPOINTS].filter((tool) => tool.enabled);
}

/**
 * External services configuration
 */
export const EXTERNAL_SERVICES = {
  SUPABASE: {
    name: 'Supabase',
    description: 'Database and authentication backend',
    healthCheckUrl: 'https://supabase.com/status',
  },
  CLERK: {
    name: 'Clerk',
    description: 'Authentication service',
    healthCheckUrl: 'https://status.clerk.com',
  },
  CLOUDFLARE: {
    name: 'Cloudflare',
    description: 'CDN and hosting',
    healthCheckUrl: 'https://www.cloudflarestatus.com',
  },
} as const;

export default {
  TOOL_URLS,
  TOOLS,
  API_ENDPOINTS,
  EXTERNAL_SERVICES,
  getEnabledTools,
  getToolById,
  getToolUrl,
  getAllMonitoredEndpoints,
};
