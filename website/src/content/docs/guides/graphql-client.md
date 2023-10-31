---
title: Graphql Client
description: graphql client
---

Next-gql provides a wrapper around [urql](https://formidable.com/open-source/urql/).

## Define client query
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
## Setup cache for query objects.
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

## Setup provider in layout (or any wrapper providing cookies, isLoggedIn status)

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

## use queries
```ts
import { useQuery } from '@enalmada/next-gql';
import { type MyTasksQuery, type Task } from '@/client/gql/generated/graphql';
import { MY_TASKS } from '@/client/gql/queries-mutations';

const [{ data, error }] = useQuery<MyTasksQuery>({ query: MY_TASKS });

```

Notes:
* types are kept in sync with codegen
* it is important to have a root `loading.tsx` which provides a final fallback suspense.  Without this, infinite querying can happen.
