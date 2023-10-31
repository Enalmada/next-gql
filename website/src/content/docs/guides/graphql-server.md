---
title: Graphql Server
description: graphql server
---

Next-GQL provides a wrapper around [graphql yoga](https://the-guild.dev/graphql/yoga-server).

## initialize graphql server
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

## Create api route `/api/graphql`

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