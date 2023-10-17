/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument */

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
