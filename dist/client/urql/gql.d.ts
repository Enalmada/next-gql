import { type AnyVariables, type TypedDocumentNode } from '@urql/core';
import { type DocumentNode } from 'graphql';
declare function gql<Data = any, Variables extends AnyVariables = AnyVariables>(strings: TemplateStringsArray, ...interpolations: Array<TypedDocumentNode | DocumentNode | string>): TypedDocumentNode<Data, Variables>;
declare function gql<Data = any, Variables extends AnyVariables = AnyVariables>(string: string): TypedDocumentNode<Data, Variables>;
export { gql };
