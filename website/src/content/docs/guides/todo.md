---
title: TODO
description: graphql server
---

## Graphql Client
- [ ] next-gql server wrapper that handles cookies automatically
- [ ] export gql tag so it doesn't need to be loaded from urql
- [ ] persisted query hash passed to server

## Codegen
- [ ] options override defaults more specifically/conveniently (don't need to replace everything)
- [ ] run automatically when next.js starts

## Graphql Server
- [ ] default error logging to console

## API Builder
- [ ] allow SchemaBuilder and options through next-gql module (they have sideEffects which may need pothos declaration)

## Build
- [ ] replace manual 'use client' hack once bun plugins supports [`onEnd`](https://github.com/oven-sh/bun/issues/2771)