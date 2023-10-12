# next-gql

Graphql is the gold standard for client server communication, yet it is a significant investment in connecting technologies.
This project aims to:
* provide sensible defaults and opinions of how to start
* allow access to underlying technologies so there is no lock in

## Technology
* [yoga](https://the-guild.dev/graphql/yoga-server) Graphql Server

## Installation
`bun install graphql next-gql`

## How to use
### Server

1) initialize graphql server
```ts
// src/server/graphql/server.ts
import User from "./UserType"

export async function handleCreateOrGetUser(req: NextRequest): Promise<User | null> {
    // function that takes in request and returns optional User
}

export interface MyContextType {
  currentUser: User;
}

function logError(message: string) {
  const log = new Logger();
  log.error(message);
  // TODO await seems to cause trouble for yoga
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  log.flush();
}

export function graphqlServer(graphqlEndpoint: string) {
  return makeServer<User>({
    schema,
    graphqlEndpoint,
    cors: {
      origin: process.env.NEXT_PUBLIC_REDIRECT_URL,
    },
    handleCreateOrGetUser,
    logError
  });
}
```
2) Use it in `/api/graphql` route
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
### TODO
## Client
- [ ] urql wrappers
- [ ] codegen bundling
## Server
- [ ] graphql interface with pothos


### Alternatives
* [Server Actions](https://codesandbox.io/p/sandbox/next-js-server-actions-prisma-postgres-demo-2fdv7l?file=%2Fapp%2Factions.ts%3A1%2C1) - really cool how you can skip api layer.
* [tRPC](https://trpc.io/) - t3 stack is a great starting point.  Consider up front eventual need for real api for mobile, etc.

## Contribute
Using [changesets](https://github.com/changesets/changesets) so please remember to run "changeset" with any PR that might be interesting to people on an older template.
