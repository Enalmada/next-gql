// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { createSchema } from 'graphql-yoga';

import { makeServer } from '../../src/server';

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello: String
    }
  `,
  resolvers: {
    Query: {
      hello: () => 'world',
    },
  },
});

export const HELLO_QUERY = `
  query Hello {
    hello
  }
`;

export type User = {
  id: string;
};

function graphqlServer(graphqlEndpoint: string) {
  return makeServer<User>({
    schema,
    graphqlEndpoint,
  });
}

describe('next-gql', () => {
  test('should throw an error when "x-graphql-csrf" header is missing', async () => {
    const server = graphqlServer('/api/graphql');

    try {
      // Action
      const response = await server.fetch('http://yoga/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: `{
            hello
          }`,
        }),
      });

      const jsonResponse = await response.json();

      expect(jsonResponse.errors).toBeDefined();
      expect(jsonResponse.errors[0].message).toEqual('Unexpected error.');
    } catch (error) {
      // Handle any unexpected errors here.
      throw error;
    }
  });
});
