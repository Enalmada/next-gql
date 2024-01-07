import getExternalDependencies, {
  bunBuild,
  getSourceFiles,
  prependDirectiveToBuiltFiles,
  removeBadClientStringFromFiles,
} from '@enalmada/bun-externals';

async function buildWithExternals(): Promise<void> {
  const entrypoints = await getSourceFiles();

  await bunBuild({
    entrypoints,
    outdir: './dist',
    target: 'node',
    external: ['*'],
    root: './src',
  });

  // Temp fix for jsxDev
  // https://github.com/oven-sh/bun/issues/3768
  // https://github.com/oven-sh/bun/issues/7499
  const externalDeps = await getExternalDependencies();

  await bunBuild({
    entrypoints: ['./src/client/urql/UrqlWrapper.tsx'],
    outdir: './dist/client',
    target: 'node',
    external: [...externalDeps, './src/client/urql/UrqlWrapper'],
    root: './src/client',
  });

  // Update the built files in './dist/client' after the build completes.
  prependDirectiveToBuiltFiles('./src/client', './dist/client');
  removeBadClientStringFromFiles('./dist');
}

void buildWithExternals();
