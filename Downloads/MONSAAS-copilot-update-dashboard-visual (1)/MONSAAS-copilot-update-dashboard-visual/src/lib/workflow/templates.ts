/**
 * Workflow Templates - Pre-built workflow templates for common automation scenarios
 */

import type { WorkflowTemplate } from './types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ==================== SALES & CRM ====================
  {
    id: 'lead-nurturing',
    name: 'Lead Nurturing Sequence',
    description: 'Automatically send a series of emails to new leads over time',
    category: 'Sales',
    icon: '🎯',
    popularity: 95,
    requiredIntegrations: ['hubspot', 'sendgrid'],
    tags: ['email', 'crm', 'automation'],
    workflow: {
      name: 'Lead Nurturing Sequence',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'hubspot',
          integrationEvent: 'contact.created',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'New Lead Created',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'delay',
          name: 'Wait 1 Hour',
          position: { x: 100, y: 200 },
          config: { delayMs: 3600000 },
        },
        {
          id: 'node-3',
          type: 'action',
          name: 'Send Welcome Email',
          position: { x: 100, y: 300 },
          config: {
            integrationId: 'sendgrid',
            actionType: 'send_email',
            parameters: {
              template: 'welcome-email',
              to: '{{contact.email}}',
            },
          },
        },
        {
          id: 'node-4',
          type: 'delay',
          name: 'Wait 3 Days',
          position: { x: 100, y: 400 },
          config: { delayMs: 259200000 },
        },
        {
          id: 'node-5',
          type: 'action',
          name: 'Send Follow-up Email',
          position: { x: 100, y: 500 },
          config: {
            integrationId: 'sendgrid',
            actionType: 'send_email',
            parameters: {
              template: 'follow-up-email',
              to: '{{contact.email}}',
            },
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
        { id: 'edge-3', source: 'node-3', target: 'node-4' },
        { id: 'edge-4', source: 'node-4', target: 'node-5' },
      ],
      variables: [
        { name: 'contact', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 86400000,
        maxRetries: 3,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['sales', 'email'],
    },
  },

  {
    id: 'deal-won-notification',
    name: 'Deal Won Celebration',
    description: 'Notify team on Slack when a deal is won and update tracking',
    category: 'Sales',
    icon: '🎉',
    popularity: 88,
    requiredIntegrations: ['hubspot', 'slack'],
    tags: ['crm', 'notifications', 'team'],
    workflow: {
      name: 'Deal Won Celebration',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'hubspot',
          integrationEvent: 'deal.updated',
        },
        filters: [
          { field: 'deal.stage', operator: 'equals', value: 'closedwon' },
        ],
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Deal Won',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'notification',
          name: 'Notify Slack',
          position: { x: 100, y: 200 },
          config: {
            channel: 'slack',
            template: '🎉 Deal Won! {{deal.name}} - ${{deal.amount}}',
            recipients: ['#sales-wins'],
          },
        },
        {
          id: 'node-3',
          type: 'action',
          name: 'Update Analytics',
          position: { x: 100, y: 300 },
          config: {
            integrationId: 'mixpanel',
            actionType: 'track_event',
            parameters: {
              event: 'deal_won',
              properties: {
                amount: '{{deal.amount}}',
                company: '{{deal.company}}',
              },
            },
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
      ],
      variables: [
        { name: 'deal', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 60000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['sales', 'notifications'],
    },
  },

  // ==================== CUSTOMER SUCCESS ====================
  {
    id: 'churn-prevention',
    name: 'Churn Prevention Alert',
    description: 'Detect at-risk customers and trigger intervention workflows',
    category: 'Customer Success',
    icon: '🛡️',
    popularity: 82,
    requiredIntegrations: ['stripe', 'slack', 'sendgrid'],
    tags: ['retention', 'alerts', 'customer'],
    workflow: {
      name: 'Churn Prevention Alert',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'schedule',
        config: {
          cron: '0 9 * * *', // Daily at 9 AM
          timezone: 'UTC',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Daily Check',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'action',
          name: 'Get At-Risk Customers',
          position: { x: 100, y: 200 },
          config: {
            integrationId: 'stripe',
            actionType: 'list_customers',
            parameters: {
              filter: 'at_risk',
            },
          },
        },
        {
          id: 'node-3',
          type: 'loop',
          name: 'For Each Customer',
          position: { x: 100, y: 300 },
          config: {
            loopType: 'forEach',
            loopSource: '{{steps.node-2.customers}}',
          },
        },
        {
          id: 'node-4',
          type: 'notification',
          name: 'Alert CS Team',
          position: { x: 100, y: 400 },
          config: {
            channel: 'slack',
            template: '⚠️ At-risk customer: {{_loopItem.name}} - Last activity: {{_loopItem.lastActivity}}',
            recipients: ['#customer-success'],
          },
        },
        {
          id: 'node-5',
          type: 'action',
          name: 'Send Retention Email',
          position: { x: 250, y: 400 },
          config: {
            integrationId: 'sendgrid',
            actionType: 'send_email',
            parameters: {
              template: 'retention-offer',
              to: '{{_loopItem.email}}',
            },
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
        { id: 'edge-3', source: 'node-3', target: 'node-4' },
        { id: 'edge-4', source: 'node-3', target: 'node-5' },
      ],
      variables: [],
      settings: {
        timeout: 300000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: true,
        logLevel: 'info',
      },
      tags: ['retention', 'customer-success'],
    },
  },

  // ==================== DEVELOPMENT ====================
  {
    id: 'pr-review-notification',
    name: 'PR Review Notification',
    description: 'Notify team members when PRs need review',
    category: 'Development',
    icon: '🔀',
    popularity: 90,
    requiredIntegrations: ['github', 'slack'],
    tags: ['development', 'github', 'notifications'],
    workflow: {
      name: 'PR Review Notification',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'github',
          integrationEvent: 'pull_request.opened',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'PR Opened',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'transform',
          name: 'Format Message',
          position: { x: 100, y: 200 },
          config: {
            mappings: [
              { source: 'pull_request.title', target: 'title' },
              { source: 'pull_request.user.login', target: 'author' },
              { source: 'pull_request.html_url', target: 'url' },
            ],
          },
        },
        {
          id: 'node-3',
          type: 'notification',
          name: 'Notify Slack',
          position: { x: 100, y: 300 },
          config: {
            channel: 'slack',
            template: '📝 New PR needs review!\n*{{title}}* by {{author}}\n{{url}}',
            recipients: ['#engineering'],
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
      ],
      variables: [
        { name: 'pull_request', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 30000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['development', 'github'],
    },
  },

  {
    id: 'deployment-notification',
    name: 'Deployment Notification',
    description: 'Notify team when a deployment is completed',
    category: 'Development',
    icon: '🚀',
    popularity: 85,
    requiredIntegrations: ['github', 'slack'],
    tags: ['deployment', 'ci-cd', 'notifications'],
    workflow: {
      name: 'Deployment Notification',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'github',
          integrationEvent: 'release.published',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Release Published',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'notification',
          name: 'Notify Team',
          position: { x: 100, y: 200 },
          config: {
            channel: 'slack',
            template: '🚀 New release deployed!\n*{{release.name}}* ({{release.tag_name}})\n{{release.html_url}}',
            recipients: ['#deployments'],
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
      ],
      variables: [
        { name: 'release', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 30000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['deployment', 'releases'],
    },
  },

  // ==================== MARKETING ====================
  {
    id: 'social-content-pipeline',
    name: 'Social Media Content Pipeline',
    description: 'Automatically schedule and post content across social platforms',
    category: 'Marketing',
    icon: '📱',
    popularity: 78,
    requiredIntegrations: ['notion', 'slack'],
    tags: ['social-media', 'content', 'automation'],
    workflow: {
      name: 'Social Media Content Pipeline',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'schedule',
        config: {
          cron: '0 8 * * 1-5', // Weekdays at 8 AM
          timezone: 'UTC',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Daily Schedule',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'action',
          name: 'Get Scheduled Content',
          position: { x: 100, y: 200 },
          config: {
            integrationId: 'notion',
            actionType: 'query_database',
            parameters: {
              database_id: '{{vars.contentDatabase}}',
              filter: {
                property: 'Status',
                select: { equals: 'Ready' },
              },
            },
          },
        },
        {
          id: 'node-3',
          type: 'condition',
          name: 'Has Content?',
          position: { x: 100, y: 300 },
          config: {
            conditions: [
              { field: 'steps.node-2.results.length', operator: 'greater_than', value: 0 },
            ],
            trueBranch: 'node-4',
            falseBranch: 'node-5',
          },
        },
        {
          id: 'node-4',
          type: 'notification',
          name: 'Send Content Alert',
          position: { x: 50, y: 400 },
          config: {
            channel: 'slack',
            template: '📅 Today\'s content is ready for review!\n{{steps.node-2.results.length}} items scheduled.',
            recipients: ['#marketing'],
          },
        },
        {
          id: 'node-5',
          type: 'notification',
          name: 'No Content Alert',
          position: { x: 200, y: 400 },
          config: {
            channel: 'slack',
            template: '⚠️ No content scheduled for today. Time to create!',
            recipients: ['#marketing'],
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
        { id: 'edge-3', source: 'node-3', target: 'node-4', sourceHandle: 'true' },
        { id: 'edge-4', source: 'node-3', target: 'node-5', sourceHandle: 'false' },
      ],
      variables: [
        { name: 'contentDatabase', type: 'string', required: true, sensitive: false, defaultValue: '' },
      ],
      settings: {
        timeout: 60000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['marketing', 'social-media'],
    },
  },

  // ==================== OPERATIONS ====================
  {
    id: 'invoice-processing',
    name: 'Automated Invoice Processing',
    description: 'Process and track invoices automatically',
    category: 'Operations',
    icon: '📄',
    popularity: 75,
    requiredIntegrations: ['stripe', 'slack', 'sendgrid'],
    tags: ['invoicing', 'payments', 'automation'],
    workflow: {
      name: 'Automated Invoice Processing',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'stripe',
          integrationEvent: 'invoice.paid',
        },
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Invoice Paid',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'action',
          name: 'Send Receipt',
          position: { x: 100, y: 200 },
          config: {
            integrationId: 'sendgrid',
            actionType: 'send_email',
            parameters: {
              template: 'payment-receipt',
              to: '{{invoice.customer_email}}',
              data: {
                amount: '{{invoice.amount_paid}}',
                invoiceNumber: '{{invoice.number}}',
              },
            },
          },
        },
        {
          id: 'node-3',
          type: 'notification',
          name: 'Notify Finance',
          position: { x: 100, y: 300 },
          config: {
            channel: 'slack',
            template: '💰 Payment received: ${{invoice.amount_paid}} from {{invoice.customer_email}}',
            recipients: ['#finance'],
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
      ],
      variables: [
        { name: 'invoice', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 60000,
        maxRetries: 3,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['finance', 'invoicing'],
    },
  },

  // ==================== SUPPORT ====================
  {
    id: 'ticket-escalation',
    name: 'Support Ticket Escalation',
    description: 'Automatically escalate high-priority tickets',
    category: 'Support',
    icon: '🎫',
    popularity: 80,
    requiredIntegrations: ['jira', 'slack'],
    tags: ['support', 'escalation', 'tickets'],
    workflow: {
      name: 'Support Ticket Escalation',
      version: 1,
      status: 'draft',
      trigger: {
        id: 'trigger-1',
        type: 'integration',
        config: {
          integrationId: 'jira',
          integrationEvent: 'issue.updated',
        },
        filters: [
          { field: 'issue.priority.name', operator: 'equals', value: 'Critical' },
        ],
      },
      nodes: [
        {
          id: 'node-1',
          type: 'trigger',
          name: 'Critical Ticket',
          position: { x: 100, y: 100 },
          config: {},
        },
        {
          id: 'node-2',
          type: 'notification',
          name: 'Page On-Call',
          position: { x: 100, y: 200 },
          config: {
            channel: 'slack',
            template: '🚨 CRITICAL: {{issue.key}} - {{issue.summary}}\nRequires immediate attention!',
            recipients: ['@oncall', '#support-escalation'],
          },
        },
        {
          id: 'node-3',
          type: 'action',
          name: 'Update Ticket',
          position: { x: 100, y: 300 },
          config: {
            integrationId: 'jira',
            actionType: 'update_issue',
            parameters: {
              issue_key: '{{issue.key}}',
              fields: {
                labels: ['escalated', 'critical'],
              },
            },
          },
        },
      ],
      edges: [
        { id: 'edge-1', source: 'node-1', target: 'node-2' },
        { id: 'edge-2', source: 'node-2', target: 'node-3' },
      ],
      variables: [
        { name: 'issue', type: 'object', required: true, sensitive: false },
      ],
      settings: {
        timeout: 30000,
        maxRetries: 2,
        notifyOnError: true,
        notifyOnComplete: false,
        logLevel: 'info',
      },
      tags: ['support', 'escalation'],
    },
  },
];

// ==================== TEMPLATE FUNCTIONS ====================

export function getTemplatesByCategory(): Record<string, WorkflowTemplate[]> {
  const categories: Record<string, WorkflowTemplate[]> = {};

  for (const template of WORKFLOW_TEMPLATES) {
    if (!categories[template.category]) {
      categories[template.category] = [];
    }
    categories[template.category].push(template);
  }

  return categories;
}

export function getPopularTemplates(limit = 5): WorkflowTemplate[] {
  return [...WORKFLOW_TEMPLATES]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

export function searchTemplates(query: string): WorkflowTemplate[] {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByIntegration(integrationId: string): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter((t) =>
    t.requiredIntegrations.includes(integrationId)
  );
}
