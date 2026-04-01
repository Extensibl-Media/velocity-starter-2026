// @ts-check
import { defineConfig, envField } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  
  site: process.env.SITE_URL || 'https://example.com',

  env: {
    schema: {
      SITE_URL: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GA_MEASUREMENT_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GTM_ID: envField.string({ context: 'client', access: 'public', optional: true }),
      GOOGLE_SITE_VERIFICATION: envField.string({ context: 'client', access: 'public', optional: true }),
      BING_SITE_VERIFICATION: envField.string({ context: 'client', access: 'public', optional: true }),
      PUBLIC_GOOGLE_MAPS_API_KEY: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
      PUBLIC_GHL_CHAT_WIDGET_ID: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
      PUBLIC_GHL_LOCATION_ID: envField.string({ context: 'client', access: 'public', optional: true, default: '' }),
    },
  },

  image: {
    layout: 'constrained',
  },

  integrations: [markdoc(), 
    sitemap(),
    icon(),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});