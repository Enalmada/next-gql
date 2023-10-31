---
title: Alternatives
description: other options
---

## vs Graphql
### [Server Actions](https://codesandbox.io/p/sandbox/next-js-server-actions-prisma-postgres-demo-2fdv7l?file=%2Fapp%2Factions.ts%3A1%2C1)
Really cool how you can skip api layer.  I believe this needs to mature more before using.  
It ultimately may only be a fit for sites that don't ever need a mobile or public api.

### [tRPC](https://trpc.io/)
t3 stack is a great starting point.  Consider up front eventual need for real api for mobile, etc.

## Client
### [Apollo Client](https://github.com/apollographql/apollo-client-nextjs)
started with this but wanted something with smaller dependency size.

## Server
### [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/)
started with this but wanted something code splittable.