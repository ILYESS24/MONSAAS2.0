/**
 * Integration Registry - Centralized hub for all third-party integrations
 * Supports OAuth2, API Key, JWT, and Webhook authentication
 */

import type {
  Integration,
  IntegrationCategory,
  AuthType,
  ConnectionStatus,
  HealthStatus,
  WebhookConfig,
  EncryptedCredentials,
} from './types';

// ==================== NATIVE INTEGRATIONS CATALOG ====================

export interface IntegrationDefinition {
  id: string;
  name: string;
  category: IntegrationCategory;
  icon: string;
  description: string;
  authType: AuthType;
  capabilities: ('read' | 'write' | 'webhook' | 'realtime')[];
  requiredScopes?: string[];
  endpoints: {
    auth?: string;
    api: string;
    webhook?: string;
  };
  rateLimit: {
    requests: number;
    perSeconds: number;
  };
  events?: string[];
  actions?: string[];
}

export const NATIVE_INTEGRATIONS: Record<string, IntegrationDefinition> = {
  // CRM & Sales
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: '☁️',
    description: 'CRM platform for sales, service, and marketing',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook', 'realtime'],
    requiredScopes: ['api', 'refresh_token'],
    endpoints: {
      auth: 'https://login.salesforce.com/services/oauth2/authorize',
      api: 'https://api.salesforce.com',
      webhook: 'https://api.salesforce.com/webhooks',
    },
    rateLimit: { requests: 100, perSeconds: 60 },
    events: ['lead.created', 'opportunity.updated', 'contact.created'],
    actions: ['create_lead', 'update_opportunity', 'send_email'],
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: '🧡',
    description: 'Inbound marketing, sales, and CRM platform',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write'],
    endpoints: {
      auth: 'https://app.hubspot.com/oauth/authorize',
      api: 'https://api.hubapi.com',
      webhook: 'https://api.hubapi.com/webhooks/v3',
    },
    rateLimit: { requests: 100, perSeconds: 10 },
    events: ['contact.created', 'deal.updated', 'form.submitted'],
    actions: ['create_contact', 'update_deal', 'send_email'],
  },
  pipedrive: {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm',
    icon: '🎯',
    description: 'Sales CRM and pipeline management',
    authType: 'apikey',
    capabilities: ['read', 'write', 'webhook'],
    endpoints: {
      api: 'https://api.pipedrive.com/v1',
      webhook: 'https://api.pipedrive.com/webhooks',
    },
    rateLimit: { requests: 80, perSeconds: 2 },
    events: ['deal.added', 'person.added', 'activity.completed'],
    actions: ['create_deal', 'add_note', 'update_person'],
  },

  // Payments
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    category: 'payment',
    icon: '💳',
    description: 'Online payment processing',
    authType: 'apikey',
    capabilities: ['read', 'write', 'webhook'],
    endpoints: {
      api: 'https://api.stripe.com/v1',
      webhook: 'https://api.stripe.com/v1/webhooks',
    },
    rateLimit: { requests: 100, perSeconds: 1 },
    events: ['payment.succeeded', 'subscription.created', 'invoice.paid'],
    actions: ['create_payment', 'create_subscription', 'refund'],
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    category: 'payment',
    icon: '🅿️',
    description: 'Online payment system',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['openid', 'profile', 'email'],
    endpoints: {
      auth: 'https://www.paypal.com/signin/authorize',
      api: 'https://api.paypal.com/v2',
      webhook: 'https://api.paypal.com/v1/notifications/webhooks',
    },
    rateLimit: { requests: 30, perSeconds: 1 },
    events: ['payment.completed', 'subscription.activated'],
    actions: ['create_order', 'capture_payment', 'refund'],
  },

  // Communication
  slack: {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: '💬',
    description: 'Team messaging and collaboration',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook', 'realtime'],
    requiredScopes: ['chat:write', 'channels:read', 'users:read'],
    endpoints: {
      auth: 'https://slack.com/oauth/v2/authorize',
      api: 'https://slack.com/api',
      webhook: 'https://hooks.slack.com/services',
    },
    rateLimit: { requests: 50, perSeconds: 60 },
    events: ['message.posted', 'reaction.added', 'channel.created'],
    actions: ['send_message', 'create_channel', 'add_reaction'],
  },
  discord: {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    icon: '🎮',
    description: 'Community chat and voice',
    authType: 'webhook',
    capabilities: ['write', 'webhook'],
    endpoints: {
      api: 'https://discord.com/api/v10',
      webhook: 'https://discord.com/api/webhooks',
    },
    rateLimit: { requests: 50, perSeconds: 1 },
    events: ['message.created', 'member.joined'],
    actions: ['send_message', 'create_embed'],
  },
  teams: {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'communication',
    icon: '👥',
    description: 'Microsoft collaboration platform',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['ChannelMessage.Send', 'Chat.ReadWrite'],
    endpoints: {
      auth: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      api: 'https://graph.microsoft.com/v1.0',
    },
    rateLimit: { requests: 100, perSeconds: 1 },
    events: ['message.created', 'team.created'],
    actions: ['send_message', 'create_meeting'],
  },

  // Email
  sendgrid: {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    icon: '📧',
    description: 'Email delivery service',
    authType: 'apikey',
    capabilities: ['write', 'webhook'],
    endpoints: {
      api: 'https://api.sendgrid.com/v3',
      webhook: 'https://api.sendgrid.com/v3/user/webhooks/event/settings',
    },
    rateLimit: { requests: 100, perSeconds: 1 },
    events: ['email.delivered', 'email.opened', 'email.clicked', 'email.bounced'],
    actions: ['send_email', 'send_template'],
  },
  mailchimp: {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'email',
    icon: '🐵',
    description: 'Email marketing platform',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['lists:read', 'lists:write', 'campaigns:write'],
    endpoints: {
      auth: 'https://login.mailchimp.com/oauth2/authorize',
      api: 'https://api.mailchimp.com/3.0',
    },
    rateLimit: { requests: 10, perSeconds: 1 },
    events: ['subscribe', 'unsubscribe', 'campaign.sent'],
    actions: ['add_subscriber', 'create_campaign', 'send_campaign'],
  },

  // Storage
  googleDrive: {
    id: 'googleDrive',
    name: 'Google Drive',
    category: 'storage',
    icon: '📁',
    description: 'Cloud file storage',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook', 'realtime'],
    requiredScopes: ['https://www.googleapis.com/auth/drive'],
    endpoints: {
      auth: 'https://accounts.google.com/o/oauth2/v2/auth',
      api: 'https://www.googleapis.com/drive/v3',
    },
    rateLimit: { requests: 1000, perSeconds: 100 },
    events: ['file.created', 'file.updated', 'file.deleted'],
    actions: ['upload_file', 'create_folder', 'share_file'],
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    icon: '📦',
    description: 'File hosting service',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['files.content.write', 'files.content.read'],
    endpoints: {
      auth: 'https://www.dropbox.com/oauth2/authorize',
      api: 'https://api.dropboxapi.com/2',
    },
    rateLimit: { requests: 1000, perSeconds: 60 },
    events: ['file.added', 'file.deleted', 'folder.created'],
    actions: ['upload_file', 'download_file', 'share_folder'],
  },
  s3: {
    id: 's3',
    name: 'Amazon S3',
    category: 'storage',
    icon: '🪣',
    description: 'AWS object storage',
    authType: 'apikey',
    capabilities: ['read', 'write'],
    endpoints: {
      api: 'https://s3.amazonaws.com',
    },
    rateLimit: { requests: 5500, perSeconds: 1 },
    events: ['object.created', 'object.deleted'],
    actions: ['put_object', 'get_object', 'delete_object'],
  },

  // Productivity
  notion: {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: '📝',
    description: 'All-in-one workspace',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'realtime'],
    requiredScopes: ['read_content', 'update_content', 'insert_content'],
    endpoints: {
      auth: 'https://api.notion.com/v1/oauth/authorize',
      api: 'https://api.notion.com/v1',
    },
    rateLimit: { requests: 3, perSeconds: 1 },
    events: ['page.created', 'page.updated', 'database.updated'],
    actions: ['create_page', 'update_page', 'add_database_row'],
  },
  asana: {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    icon: '✅',
    description: 'Work management platform',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['default'],
    endpoints: {
      auth: 'https://app.asana.com/-/oauth_authorize',
      api: 'https://app.asana.com/api/1.0',
    },
    rateLimit: { requests: 150, perSeconds: 60 },
    events: ['task.created', 'task.completed', 'project.updated'],
    actions: ['create_task', 'update_task', 'add_comment'],
  },
  trello: {
    id: 'trello',
    name: 'Trello',
    category: 'productivity',
    icon: '📋',
    description: 'Kanban-style boards',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['read', 'write'],
    endpoints: {
      auth: 'https://trello.com/1/authorize',
      api: 'https://api.trello.com/1',
    },
    rateLimit: { requests: 100, perSeconds: 10 },
    events: ['card.created', 'card.moved', 'checklist.completed'],
    actions: ['create_card', 'move_card', 'add_member'],
  },
  jira: {
    id: 'jira',
    name: 'Jira',
    category: 'productivity',
    icon: '🔷',
    description: 'Issue tracking and project management',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['read:jira-work', 'write:jira-work'],
    endpoints: {
      auth: 'https://auth.atlassian.com/authorize',
      api: 'https://api.atlassian.com/ex/jira',
    },
    rateLimit: { requests: 100, perSeconds: 1 },
    events: ['issue.created', 'issue.updated', 'sprint.completed'],
    actions: ['create_issue', 'update_issue', 'add_comment'],
  },

  // Analytics
  googleAnalytics: {
    id: 'googleAnalytics',
    name: 'Google Analytics',
    category: 'analytics',
    icon: '📊',
    description: 'Web analytics service',
    authType: 'oauth2',
    capabilities: ['read'],
    requiredScopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    endpoints: {
      auth: 'https://accounts.google.com/o/oauth2/v2/auth',
      api: 'https://analyticsdata.googleapis.com/v1beta',
    },
    rateLimit: { requests: 10, perSeconds: 1 },
    events: [],
    actions: ['run_report', 'get_realtime_data'],
  },
  mixpanel: {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    icon: '📈',
    description: 'Product analytics',
    authType: 'apikey',
    capabilities: ['read', 'write'],
    endpoints: {
      api: 'https://mixpanel.com/api/2.0',
    },
    rateLimit: { requests: 60, perSeconds: 60 },
    events: [],
    actions: ['track_event', 'create_funnel', 'export_data'],
  },

  // Development
  github: {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: '🐙',
    description: 'Code hosting and version control',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['repo', 'workflow'],
    endpoints: {
      auth: 'https://github.com/login/oauth/authorize',
      api: 'https://api.github.com',
      webhook: 'https://api.github.com/repos',
    },
    rateLimit: { requests: 5000, perSeconds: 3600 },
    events: ['push', 'pull_request.opened', 'issue.created', 'release.published'],
    actions: ['create_issue', 'create_pr', 'merge_pr', 'create_release'],
  },
  gitlab: {
    id: 'gitlab',
    name: 'GitLab',
    category: 'development',
    icon: '🦊',
    description: 'DevOps platform',
    authType: 'oauth2',
    capabilities: ['read', 'write', 'webhook'],
    requiredScopes: ['api', 'read_repository'],
    endpoints: {
      auth: 'https://gitlab.com/oauth/authorize',
      api: 'https://gitlab.com/api/v4',
    },
    rateLimit: { requests: 2000, perSeconds: 60 },
    events: ['push', 'merge_request.opened', 'pipeline.completed'],
    actions: ['create_issue', 'create_mr', 'trigger_pipeline'],
  },
};

// ==================== INTEGRATION REGISTRY CLASS ====================

export class IntegrationRegistry {
  private integrations: Map<string, Integration> = new Map();
  private listeners: Map<string, Set<(integration: Integration) => void>> = new Map();

  constructor() {
    // Initialize with disconnected states for all native integrations
    Object.values(NATIVE_INTEGRATIONS).forEach((def) => {
      this.integrations.set(def.id, this.createDefaultIntegration(def));
    });
  }

  private createDefaultIntegration(def: IntegrationDefinition): Integration {
    return {
      id: def.id,
      name: def.name,
      category: def.category,
      provider: def.id,
      icon: def.icon,
      status: 'disconnected',
      auth: {
        type: def.authType,
        scopes: def.requiredScopes,
      },
      capabilities: def.capabilities,
      rateLimit: {
        ...def.rateLimit,
        remaining: def.rateLimit.requests,
        resetAt: Date.now() + def.rateLimit.perSeconds * 1000,
      },
      healthCheck: {
        lastCheck: 0,
        status: 'down',
        latency: 0,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // Get all integrations
  getAll(): Integration[] {
    return Array.from(this.integrations.values());
  }

  // Get integration by ID
  get(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  // Get integrations by category
  getByCategory(category: IntegrationCategory): Integration[] {
    return this.getAll().filter((i) => i.category === category);
  }

  // Get connected integrations
  getConnected(): Integration[] {
    return this.getAll().filter((i) => i.status === 'connected');
  }

  // Connect an integration
  async connect(
    id: string,
    credentials: EncryptedCredentials,
    options?: {
      refreshToken?: string;
      expiresAt?: number;
      scopes?: string[];
    }
  ): Promise<Integration> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updated: Integration = {
      ...integration,
      status: 'connected',
      auth: {
        ...integration.auth,
        credentials,
        refreshToken: options?.refreshToken,
        expiresAt: options?.expiresAt,
        scopes: options?.scopes || integration.auth.scopes,
      },
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);

    // Perform initial health check
    await this.checkHealth(id);

    return updated;
  }

  // Disconnect an integration
  disconnect(id: string): Integration {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updated: Integration = {
      ...integration,
      status: 'disconnected',
      auth: {
        type: integration.auth.type,
        scopes: integration.auth.scopes,
      },
      healthCheck: {
        lastCheck: Date.now(),
        status: 'down',
        latency: 0,
      },
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);

    return updated;
  }

  // Update integration status
  updateStatus(id: string, status: ConnectionStatus): Integration {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updated: Integration = {
      ...integration,
      status,
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);

    return updated;
  }

  // Check health of an integration
  async checkHealth(id: string): Promise<HealthStatus> {
    const integration = this.integrations.get(id);
    if (!integration || integration.status !== 'connected') {
      return 'down';
    }

    const definition = NATIVE_INTEGRATIONS[id];
    if (!definition) {
      return 'down';
    }

    const startTime = performance.now();
    let status: HealthStatus = 'healthy';
    let errorMessage: string | undefined;

    try {
      // Simulate API health check (in production, this would make actual requests)
      const response = await fetch(definition.endpoints.api, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);

      if (!response || !response.ok) {
        status = response ? 'degraded' : 'down';
        errorMessage = response ? `HTTP ${response.status}` : 'Connection failed';
      }
    } catch (error) {
      status = 'down';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    const latency = Math.round(performance.now() - startTime);

    const updated: Integration = {
      ...integration,
      healthCheck: {
        lastCheck: Date.now(),
        status,
        latency,
        errorMessage,
      },
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);

    return status;
  }

  // Add webhook configuration
  addWebhook(id: string, webhook: Omit<WebhookConfig, 'id' | 'createdAt'>): WebhookConfig {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const newWebhook: WebhookConfig = {
      ...webhook,
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: Date.now(),
    };

    const updated: Integration = {
      ...integration,
      webhooks: [...(integration.webhooks || []), newWebhook],
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);

    return newWebhook;
  }

  // Remove webhook configuration
  removeWebhook(id: string, webhookId: string): void {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updated: Integration = {
      ...integration,
      webhooks: (integration.webhooks || []).filter((w) => w.id !== webhookId),
      updatedAt: Date.now(),
    };

    this.integrations.set(id, updated);
    this.notifyListeners(id, updated);
  }

  // Subscribe to integration changes
  subscribe(id: string, callback: (integration: Integration) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id)!.add(callback);

    return () => {
      this.listeners.get(id)?.delete(callback);
    };
  }

  private notifyListeners(id: string, integration: Integration): void {
    this.listeners.get(id)?.forEach((callback) => callback(integration));
  }

  // Update rate limit after API call
  decrementRateLimit(id: string): void {
    const integration = this.integrations.get(id);
    if (!integration) return;

    const now = Date.now();
    let remaining = integration.rateLimit.remaining;
    let resetAt = integration.rateLimit.resetAt;

    // Reset if window has passed
    if (now >= resetAt) {
      remaining = integration.rateLimit.requests;
      resetAt = now + integration.rateLimit.perSeconds * 1000;
    }

    // Decrement
    remaining = Math.max(0, remaining - 1);

    const updated: Integration = {
      ...integration,
      rateLimit: {
        ...integration.rateLimit,
        remaining,
        resetAt,
      },
    };

    this.integrations.set(id, updated);
  }

  // Check if rate limit allows request
  canMakeRequest(id: string): boolean {
    const integration = this.integrations.get(id);
    if (!integration) return false;

    const now = Date.now();
    if (now >= integration.rateLimit.resetAt) {
      return true; // Window will reset
    }

    return integration.rateLimit.remaining > 0;
  }
}

// Singleton instance
export const integrationRegistry = new IntegrationRegistry();
