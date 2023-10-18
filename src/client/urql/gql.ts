import { gql as originalGql } from '@urql/core';

const gql = originalGql;

export { gql };

/*
/!* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument *!/
// Although docs imply to use `@urql/next`, `@urql/core` in necessary for
// the way the yoga tests are currently written.  Will error getting query in vite without this.
import { gql as originalGql, type AnyVariables, type TypedDocumentNode } from '@urql/core';
import { type DocumentNode } from 'graphql';

// Export gql so users can get it from next-gql rather than @urql/core
function gql<Data = any, Variables extends AnyVariables = AnyVariables>(
  strings: TemplateStringsArray,
  ...interpolations: Array<TypedDocumentNode | DocumentNode | string>
): TypedDocumentNode<Data, Variables>;

function gql<Data = any, Variables extends AnyVariables = AnyVariables>(
  string: string
): TypedDocumentNode<Data, Variables>;

function gql<Data = any, Variables extends AnyVariables = AnyVariables>(
  strings: TemplateStringsArray | string,
  ...interpolations: Array<TypedDocumentNode | DocumentNode | string>
): TypedDocumentNode<Data, Variables> {
  return originalGql(strings as any, ...interpolations);
}

export { gql };
*/
