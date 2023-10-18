/// <reference types="bun-types" />

import packageJson from './package.json';
import { prependDirectiveToBuiltFiles } from './prependClientDirective';

function getExternalsFromPackageJson(): string[] {
  const sections: (keyof typeof packageJson)[] = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
  ];
  const externals: string[] = [];

  for (const section of sections) {
    if (packageJson[section]) {
      externals.push(...Object.keys(packageJson[section]));
    }
  }

  // Removing potential duplicates between dev and peer
  return Array.from(new Set(externals));
}

async function buildWithExternals(): Promise<void> {
  const externalDeps = getExternalsFromPackageJson();

  // TODO figure out way of getting 'use client' into NextGqlProvider.js build

  await Bun.build({
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

  await Bun.build({
    entrypoints: ['./src/server/index.ts'],
    outdir: './dist',
    target: 'node',
    external: externalDeps,
    root: './src',
  });
}

void buildWithExternals();
