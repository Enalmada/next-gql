---
title: API Builder
description: Code first api building
---

Next-GQL provides helper functions for [Pothos](https://pothos-graphql.dev/).

## initialize schema builder
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

## use the builder to create client types and then query/mutation interfaces
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