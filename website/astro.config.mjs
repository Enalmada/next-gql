import prefetch from '@astrojs/prefetch';
import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'next-gql',
      defaultLocale: 'root', // optional
      locales: {
        root: {
          label: 'English',
          lang: 'en', // lang is required for root locales
        },
      },
      social: {
        github: 'https://github.com/Enalmada/next-gql',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: 'Getting Started',
              link: '/guides/getting-started/',
            },
            {
              label: 'API Builder',
              link: '/guides/api-builder/',
            },
            {
              label: 'Graphql Server',
              link: '/guides/graphql-server/',
            },
            {
              label: 'Graphql Client',
              link: '/guides/graphql-client/',
            },
            {
              label: 'Client Schema',
              link: '/guides/client-schema/',
            },
            {
              label: 'TODO',
              link: '/guides/todo/',
            },
          ],
        },
        {
          label: 'Technologies',
          items: [
            {
              label: 'Summary',
              link: '/technologies/summary/',
            },
            {
              label: 'Alternatives',
              link: '/technologies/alternatives/',
            },
          ],
        },
      ],
      customCss: ['./src/assets/landing.css', './src/tailwind.css'],
    }),
    react(),
    // applyBaseStyles causes lists to not work anymore
    tailwind({
      applyBaseStyles: false,
    }),
    prefetch(),
  ],
});
