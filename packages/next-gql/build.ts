/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="bun-types" />
import { bunBuild, getSourceFiles } from '@enalmada/bun-externals';

import {
  prependDirectiveToBuiltFiles,
  removeBadClientStringFromFiles,
} from './prependClientDirective';

async function buildWithExternals(): Promise<void> {
  const entryPoints = await getSourceFiles();

  await bunBuild({
    entrypoints: entryPoints,
    outdir: './dist',
    target: 'node',
    external: ['*'],
    root: './src',
  });

  // Update the built files in './dist/client' after the build completes.
  prependDirectiveToBuiltFiles('./src/client', './dist/client');
  removeBadClientStringFromFiles('./dist');
}

void buildWithExternals();
