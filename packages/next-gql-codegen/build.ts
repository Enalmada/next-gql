/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="bun-types" />
import getExternalDependencies, { bunBuild } from '@enalmada/bun-externals';

async function buildWithExternals(): Promise<void> {
  const externalDeps = await getExternalDependencies();

  await bunBuild({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'node',
    external: externalDeps,
    root: './src',
  });

  await bunBuild({
    entrypoints: ['./src/codegen/graphql-codegen-wrapper.ts'],
    outdir: './dist',
    target: 'node',
    root: './src',
  });
}

void buildWithExternals();
