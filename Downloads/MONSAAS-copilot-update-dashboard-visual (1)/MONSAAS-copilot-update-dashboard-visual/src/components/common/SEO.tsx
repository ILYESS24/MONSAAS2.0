/**
 * SEO Component - Aurion Studio
 * 
 * Gestion complète des meta tags pour un score SEO de 100%
 * - Meta tags standard
 * - Open Graph (Facebook, LinkedIn)
 * - Twitter Cards
 * - JSON-LD Structured Data
 * - Canonical URLs
 * - Hreflang tags
 */

import { useEffect } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, unknown>;
  alternateLanguages?: { lang: string; url: string }[];
}

interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  foundingDate: string;
  founders: { '@type': string; name: string }[];
  address: { '@type': string; addressLocality: string; addressCountry: string };
  contactPoint: { '@type': string; contactType: string; email: string; availableLanguage: string[] };
  sameAs: string[];
  [key: string]: unknown;
}

interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
  [key: string]: unknown;
}

interface SoftwareApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: string;
  };
  [key: string]: unknown;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SITE_NAME = 'Aurion Studio';
const SITE_URL = 'https://aurion.studio';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@aurionstudio';
const DEFAULT_LOCALE = 'fr_FR';

// =============================================================================
// STRUCTURED DATA TEMPLATES
// =============================================================================

export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Aurion Studio',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Plateforme SaaS tout-en-un pour développeurs : Code Editor, App Builder, Agent AI, Chat, et automatisation workflow.',
  foundingDate: '2024',
  founders: [
    { '@type': 'Person', name: 'Marie Laurent' },
    { '@type': 'Person', name: 'Thomas Dubois' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Paris',
    addressCountry: 'FR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'support@aurion.studio',
    availableLanguage: ['French', 'English'],
  },
  sameAs: [
    'https://twitter.com/aurionstudio',
    'https://linkedin.com/company/aurionstudio',
    'https://github.com/aurionstudio',
  ],
};

export const webSiteSchema: WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Aurion Studio',
  url: SITE_URL,
  description: 'Plateforme SaaS de développement avec outils IA intégrés',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const softwareApplicationSchema: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Aurion Studio',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2847',
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const updateMetaTag = (name: string, content: string, isProperty = false) => {
  const attribute = isProperty ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

const updateLinkTag = (rel: string, href: string, additionalAttrs?: Record<string, string>) => {
  let existingLink = document.querySelector(`link[rel="${rel}"]${additionalAttrs?.hreflang ? `[hreflang="${additionalAttrs.hreflang}"]` : ''}`);
  
  if (!existingLink) {
    existingLink = document.createElement('link');
    existingLink.setAttribute('rel', rel);
    document.head.appendChild(existingLink);
  }
  
  existingLink.setAttribute('href', href);
  
  if (additionalAttrs) {
    Object.entries(additionalAttrs).forEach(([key, value]) => {
      existingLink?.setAttribute(key, value);
    });
  }
};

const addStructuredData = (id: string, data: Record<string, unknown>) => {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
};

const removeStructuredData = (id: string) => {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
};

// =============================================================================
// SEO COMPONENT
// =============================================================================

export const SEO = ({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  author = SITE_NAME,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  structuredData,
  alternateLanguages = [],
}: SEOProps) => {
  useEffect(() => {
    // Page title
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords.length > 0) {
      updateMetaTag('keywords', keywords.join(', '));
    }
    updateMetaTag('author', author);

    // Robots
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
      'max-image-preview:large',
      'max-snippet:-1',
      'max-video-preview:-1',
    ].join(', ');
    updateMetaTag('robots', robotsContent);
    updateMetaTag('googlebot', robotsContent);

    // Canonical URL
    const canonical = canonicalUrl || window.location.href.split('?')[0];
    updateLinkTag('canonical', canonical);

    // Open Graph
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:url', canonical, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', title, true);
    updateMetaTag('og:site_name', SITE_NAME, true);
    updateMetaTag('og:locale', DEFAULT_LOCALE, true);

    // Article-specific Open Graph
    if (ogType === 'article') {
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (section) updateMetaTag('article:section', section, true);
      if (author) updateMetaTag('article:author', author, true);
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag:${index}`, tag, true);
      });
    }

    // Twitter Cards
    updateMetaTag('twitter:card', twitterCard);
    updateMetaTag('twitter:site', TWITTER_HANDLE);
    updateMetaTag('twitter:creator', TWITTER_HANDLE);
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:image:alt', title);

    // Additional SEO meta tags
    updateMetaTag('format-detection', 'telephone=no');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('apple-mobile-web-app-title', SITE_NAME);
    updateMetaTag('application-name', SITE_NAME);
    updateMetaTag('msapplication-TileColor', '#000000');
    updateMetaTag('theme-color', '#000000');

    // Alternate languages (hreflang)
    alternateLanguages.forEach(({ lang, url }) => {
      updateLinkTag('alternate', url, { hreflang: lang });
    });

    // Default structured data (Organization + WebSite)
    addStructuredData('schema-organization', organizationSchema);
    addStructuredData('schema-website', webSiteSchema);
    addStructuredData('schema-software', softwareApplicationSchema);

    // Page-specific structured data
    if (structuredData) {
      addStructuredData('schema-page', structuredData);
    }

    // Cleanup function
    return () => {
      removeStructuredData('schema-page');
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogImage,
    ogType,
    twitterCard,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noindex,
    nofollow,
    structuredData,
    alternateLanguages,
  ]);

  return null;
};

// =============================================================================
// PAGE-SPECIFIC SEO CONFIGS
// =============================================================================

export const seoConfigs = {
  home: {
    title: 'Aurion Studio - Plateforme SaaS de Développement avec IA',
    description: 'Créez, développez et déployez vos applications web avec Aurion Studio. Code Editor, App Builder, Agent AI et automatisation workflow intégrés. Essai gratuit.',
    keywords: [
      'plateforme SaaS',
      'développement web',
      'intelligence artificielle',
      'code editor',
      'app builder',
      'automatisation workflow',
      'outils développeur',
      'low-code',
      'no-code',
      'IA générative',
    ],
  },

  about: {
    title: 'À Propos - Notre Mission et Notre Équipe',
    description: 'Découvrez l\'équipe derrière Aurion Studio. 50K+ utilisateurs nous font confiance. Mission : démocratiser le développement web grâce à l\'IA.',
    keywords: [
      'équipe Aurion Studio',
      'startup SaaS',
      'développement IA',
      'mission entreprise',
      'innovation tech',
      'fondateurs',
    ],
  },


  contact: {
    title: 'Contact - Parlons de Votre Projet',
    description: 'Contactez l\'équipe Aurion Studio. Réponse garantie en moins de 2h. Support 24/7, chat en direct, ou planifiez une démo personnalisée.',
    keywords: [
      'contact Aurion Studio',
      'support client',
      'démo produit',
      'assistance technique',
      'service client',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'Organization',
        name: 'Aurion Studio',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'support@aurion.studio',
          availableLanguage: ['French', 'English'],
          areaServed: 'Worldwide',
        },
      },
    },
  },

  blog: {
    title: 'Blog - Actualités et Tutoriels Développement',
    description: 'Articles, tutoriels et guides sur le développement web, l\'IA, et l\'automatisation. Restez à jour avec les dernières tendances tech.',
    keywords: [
      'blog développement',
      'tutoriels programmation',
      'actualités tech',
      'guides IA',
      'articles SaaS',
      'formation développeur',
    ],
    ogType: 'website' as const,
  },

  dashboard: {
    title: 'Dashboard - Votre Espace de Travail',
    description: 'Accédez à votre dashboard Aurion Studio. Gérez vos projets, outils et automatisations en un seul endroit.',
    keywords: ['dashboard', 'espace de travail', 'gestion projets'],
    noindex: true, // Dashboard is private
  },

  monitoring: {
    title: 'Monitoring Live - Surveillance en Temps Réel',
    description: 'Surveillez vos applications et endpoints en temps réel. Health checks, alertes, et métriques de performance.',
    keywords: [
      'monitoring',
      'surveillance',
      'health checks',
      'uptime monitoring',
      'alertes',
    ],
  },

  workflows: {
    title: 'Workflow Builder - Automatisation Intelligente',
    description: 'Créez des workflows automatisés avec notre éditeur visuel. 20+ intégrations natives : Slack, Stripe, HubSpot, GitHub, et plus.',
    keywords: [
      'workflow automation',
      'automatisation',
      'intégrations',
      'zapier alternative',
      'no-code automation',
    ],
  },

  privacy: {
    title: 'Politique de Confidentialité - Protection de Vos Données',
    description: 'Politique de confidentialité Aurion Studio. Conforme RGPD. Vos données sont protégées et jamais revendues.',
    keywords: ['politique confidentialité', 'RGPD', 'protection données', 'privacy policy'],
  },

  terms: {
    title: 'Conditions d\'Utilisation - Règles du Service',
    description: 'Conditions générales d\'utilisation Aurion Studio. Découvrez vos droits et obligations en utilisant notre plateforme.',
    keywords: ['conditions utilisation', 'CGU', 'terms of service', 'règlement'],
  },

  cookies: {
    title: 'Politique des Cookies - Gestion des Traceurs',
    description: 'Politique des cookies Aurion Studio. Informations sur les cookies utilisés et comment les gérer.',
    keywords: ['cookies', 'traceurs', 'cookie policy', 'RGPD cookies'],
  },

  legal: {
    title: 'Mentions Légales - Informations Juridiques',
    description: 'Mentions légales Aurion Studio. Informations sur l\'éditeur, l\'hébergeur et les droits d\'auteur.',
    keywords: ['mentions légales', 'informations juridiques', 'éditeur', 'hébergeur'],
  },

  signIn: {
    title: 'Connexion - Accédez à Votre Compte',
    description: 'Connectez-vous à Aurion Studio pour accéder à vos projets et outils. Connexion sécurisée avec authentification multi-facteurs.',
    keywords: ['connexion', 'login', 'authentification', 'compte utilisateur'],
    noindex: true,
  },

  signUp: {
    title: 'Inscription Gratuite - Créez Votre Compte',
    description: 'Créez votre compte Aurion Studio gratuitement. Accédez à 3 projets, 1 Go de stockage, et tous les outils de base.',
    keywords: ['inscription', 'créer compte', 'essai gratuit', 'register'],
  },
};

export default SEO;
