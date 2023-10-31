---
title: Client Schema
description: client schema
---

Next-gql provides wrapper around [graphql-codegen](https://the-guild.dev/graphql/codegen).
Options to createCodegenConfig can override any graphql-codegen setting.

## create a `codegen.ts` config file
```ts
import createCodegenConfig from '@enalmada/next-gql-codegen';

const config = createCodegenConfig();

export default config;
```
## create a script to run graphql-codegen-wrapper
```
    "codegen": "bun graphql-codegen-wrapper --watch",
```

## run concurrently with dev server
   [start-server-and-test](https://www.npmjs.com/package/start-server-and-test) is one option to wait for server to be up
   to collect current schema from.
```
    "dev": "start-server-and-test dev http-get://localhost:3000/api/graphql codegen",
```

Notice when queries and mutation change, client schema is updated.
Default assumptions:
* server url is http://localhost:3000/api/graphql
* server relevant files: `src/server/graphql/(builder|schema).ts`, `src/server/**/*.model.ts`,
* query file `src/client/gql/queries-mutations.ts`
* generated directory `src/client/gql/generated/`

These can be overwritten with options and someday will be more specifically configurable.