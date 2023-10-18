/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="bun-types" />

import getExternalDependencies, { bunBuild } from '@enalmada/bun-externals';

import { prependDirectiveToBuiltFiles } from './prependClientDirective';

async function buildWithExternals(): Promise<void> {
  const externalDeps = await getExternalDependencies();

  await bunBuild({
    entrypoints: [
      './src/client/urql/index.ts',
      './src/client/urql/gql.ts',
      './src/client/urql/UrqlWrapper.tsx',
      './src/client/urql/cacheExchange.ts',
    ],
    outdir: './dist/client',
    target: 'node',
    external: [...externalDeps, './src/client/urql/UrqlWrapper', './src/client/urql/cacheExchange'],
    root: './src/client',
  });

  // Update the built files in './dist/client' after the build completes.
  prependDirectiveToBuiltFiles('./src/client', './dist/client');

  await bunBuild({
    entrypoints: ['./src/server/index.ts'],
    outdir: './dist',
    target: 'node',
    external: externalDeps,
    root: './src',
  });
}

void buildWithExternals();
