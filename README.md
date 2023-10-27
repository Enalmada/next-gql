# next-gql

Graphql is the gold standard for client server communication, yet it is a significant investment in connecting technologies.
This project aims to:
* provide sensible defaults and opinions. Minimal dependencies and immediate production ready
* allow access to underlying technologies for advanced configuration and no lock in

## Underlying Technology Stack
* [yoga](https://the-guild.dev/graphql/yoga-server) Graphql Server
* [Pothos](https://pothos-graphql.dev/) Graphql Code First API Builder
* [urql](https://formidable.com/open-source/urql/) Graphql Client
* [graphql-codegen](https://the-guild.dev/graphql/codegen) Client Schema Generation

## Installation
`bun install graphql @enalmada/next-gql`
`bun install -D @enalmada/next-gql-codegen`

## How to use

### Graphql Code First API Builder

Next-GQL provides helper functions for [Pothos](https://pothos-graphql.dev/).

1) initialize schema builder
```ts
// server/graphql/builder.ts
import { type User } from '@/server/db/schema';
import { initializeBuilder, type DefaultScalars } from '@enalmada/next-gql/server';
import SchemaBuilder from '@pothos/core';
import WithInputPlugin from '@pothos/plugin-with-input';

export interface MyContextType {
  currentUser: User;
}

type DefaultUserSchemaTypes = DefaultScalars & { Context: MyContextType };

export const builder = new SchemaBuilder<DefaultUserSchemaTypes>({ plugins: [WithInputPlugin] });

initializeBuilder(builder);
```

2) use the builder to create client types and then query/mutation interfaces
```ts
// server/task/task.model.ts
import { type Task, type TaskInput } from '@/server/db/schema';
import { builder } from '@/server/graphql/builder';
import TaskService, { type TasksInput } from '@/server/task/task.service';


export const TaskType = builder.objectRef<Task>('Task');

TaskType.implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.expose('title', {
      type: 'NonEmptyString',
    }),
    ...
  }),
});

builder.queryField('task', (t) =>
  t.field({
    type: TaskType,
    args: {
      id: t.arg.id({ required: true }),
    },
    nullable: true,
    resolve: async (_root, args, ctx) => {
      return new TaskService().task(ctx.currentUser, args.id as string, ctx);
    },
  })
);
```

### Graphql Server

Next-GQL provides a wrapper around [graphql yoga](https://the-guild.dev/graphql/yoga-server).  

1) initialize graphql server
```ts
// src/server/graphql/server.ts
import User from "./UserType"
import { makeServer } from '@enalmada/next-gql/server';

export async function handleCreateOrGetUser(req: NextRequest): Promise<User | null> {
    // function that takes in request and returns optional User
}

function logError(message: string) {
  const log = new Logger();
  log.error(message);
  // TODO await seems to cause trouble for yoga
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  log.flush();
}

export const baseURL = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : process.env.NEXT_PUBLIC_REDIRECT_URL || `http://localhost:${process.env.PORT || 3000}`;

export function graphqlServer(graphqlEndpoint: string) {
  return makeServer<User>({
    schema,
    graphqlEndpoint,
    cors: {
      origin: baseURL,
    },
    handleCreateOrGetUser,
    logError
  });
}
```
2) Create api route `/api/graphql`
```ts
// src/app/api/route.ts
import { type NextRequest } from 'next/server';
import { graphqlServer } from '@/server/graphql/server';

const { handleRequest } = graphqlServer('/api/graphql');

export const GET = (request: NextRequest) => {
  return handleRequest(request, { context: (request: NextRequest) => ({ request }) });
};

export const POST = (request: NextRequest) => {
  return handleRequest(request, { context: (request: NextRequest) => ({ request }) });
};
```

### Graphql Client

Next-gql provides a wrapper around [urql](https://formidable.com/open-source/urql/).

1. Define client query
```ts
// @/client/gql/queries-mutations
import { gql } from '@urql/core';

export const MY_TASKS = gql`
  query MyTasks {
    me {
      id
      tasks {
        id
      }
    }
  }
`;
```
2. Setup cache for query objects.
[Normalized cache](https://formidable.com/open-source/urql/docs/graphcache/normalized-caching/) is worth a read to understand
why we define createTask and deleteTask mutation functions.  TLDR: automatically add and remove entities from the cache.
from the cache.
```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { type MyTasksQuery, type Task } from '@/client/gql/generated/graphql';
import schema from '@/client/gql/generated/schema.json';
import { MY_TASKS } from '@/client/gql/queries-mutations';
import {
  createCacheExchange,
  type Cache,
  type CacheExchangeOptions,
} from '@enalmada/next-gql/client/urql/cacheExchange';

const userDefinedConfig: CacheExchangeOptions = {
  schema,
  updates: {
    Mutation: {
      createTask(result: { createTask: Task }, _args: any, cache: Cache) {
        cache.updateQuery({ query: MY_TASKS }, (data: MyTasksQuery | null) => {
          if (result && data?.me?.tasks) {
            const updatedTasks = [...data.me.tasks, result.createTask];
            return { ...data, me: { ...data.me, tasks: updatedTasks } };
          }
          return data;
        });
      },
      deleteTask(_result: any, args: { id: string }, cache: Cache) {
        cache.updateQuery({ query: MY_TASKS }, (data: MyTasksQuery | null) => {
          if (data?.me?.tasks) {
            const updatedTasks = data.me.tasks.filter((task) => task.id !== args.id);
            return { ...data, me: { ...data.me, tasks: updatedTasks } };
          }
          return data;
        });
      },
    },
  },
};

export const cacheExchange = createCacheExchange(userDefinedConfig);

```
3. Setup provider in layout (or any wrapper providing cookies, isLoggedIn status)
```ts
// layout.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { UrqlWrapper as NextGqlProvider } from '@enalmada/next-gql/client/urql/UrqlWrapper';
import { cacheExchange } from '@/client/gql/cacheExchange';

export async function Layout({ children }: { children: React.ReactNode }) {
  const cookie = cookies().toString();
  const url = process.env.URL + '/api/graphql';
  
  return (
    <NextGqlProvider
      url={url}
      isLoggedIn={boolean}
      cookie={cookie}
      cacheExchange={cacheExchange}
        >
        {children}
    </NextGqlProvider>
  );
}
```

4. use queries
```ts
import { useQuery } from '@enalmada/next-gql';
import { type MyTasksQuery, type Task } from '@/client/gql/generated/graphql';
import { MY_TASKS } from '@/client/gql/queries-mutations';

const [{ data, error }] = useQuery<MyTasksQuery>({ query: MY_TASKS });

```

Notes:
* types are kept in sync with codegen
* it is important to have a root `loading.tsx` which provides a final fallback suspense.  Without this, infinite querying can happen.

### Client Schema Generation

Next-gql provides wrapper around [graphql-codegen](https://the-guild.dev/graphql/codegen).
Options to createCodegenConfig can override any graphql-codegen setting.

1. create a `codegen.ts` file at root:
```ts
import createCodegenConfig from '@enalmada/next-gql-codegen';

const config = createCodegenConfig();

export default config;
```
2. create a script in package.json to run graphql-codegen-wrapper.
```
    "codegen": "bun graphql-codegen-wrapper --watch",
```

3. run concurrently with your dev server. 
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

### TODO
#### Graphql Client
- [ ] next-gql server wrapper that handles cookies automatically
- [ ] export gql tag so it doesn't need to be loaded from urql
- [ ] persisted query hash passed to server
#### Codegen
- [ ] options override defaults more specifically/conveniently (don't need to replace everything) 
- [ ] run automatically when next.js starts
#### Graphql Server
- [ ] default error logging to console
#### API Builder
- [ ] allow SchemaBuilder and options through next-gql module (they have sideEffects which may need pothos declaration)
#### Build
- [ ] replace manual 'use client' hack once bun plugins supports [`onEnd`](https://github.com/oven-sh/bun/issues/2771)

### Alternatives
#### To Graphql
* [Server Actions](https://codesandbox.io/p/sandbox/next-js-server-actions-prisma-postgres-demo-2fdv7l?file=%2Fapp%2Factions.ts%3A1%2C1) - really cool how you can skip api layer.
* [tRPC](https://trpc.io/) - t3 stack is a great starting point.  Consider up front eventual need for real api for mobile, etc.
#### Client
* [Apollo Client](https://github.com/apollographql/apollo-client-nextjs) - started with this but wanted something with smaller dependency size.
#### Server
* [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/) - started with this but wanted something code splittable.

## Contribute
Using [changesets](https://github.com/changesets/changesets) so please remember to run "changeset" with any PR that might be interesting to people on an older template.

### Development Workflow
Unfortunately bun link seems to have trouble with graphql and updating binaries.  This is the current workaround:
In module, run 'bun lint:fix && bun run build:pack`
In application, run one of as applicable:
* 'bun uninstall @enalmada/next-gql && bun install file:<path>/next-gql/packages/next-gql/enalmada-next-gql-<version>.tgz'
* 'bun uninstall @enalmada/next-gql-codegen && bun install file:<path>/next-gql/packages/next-gql-codegen/enalmada-next-gql-codegen-<version>.tgz'

