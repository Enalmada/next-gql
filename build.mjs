await Bun.build({
  entrypoints: ['./src/server/index.ts'],
  outdir: './dist',
  target: 'node',
  external: [
    'graphql-yoga',
    '@envelop/generic-auth',
    '@escape.tech/graphql-armor',
    '@graphql-yoga/plugin-apq',
    '@graphql-yoga/plugin-csrf-prevention',
    'graphql',
    'next',
    'next/server',
  ],
  root: './src',
});
