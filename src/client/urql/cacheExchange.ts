/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return */
'use client';

import { type Exchange } from '@urql/core';
import {
  cacheExchange,
  type Cache,
  type CacheExchangeOpts,
  type Data,
} from '@urql/exchange-graphcache';
import { type IntrospectionObjectType } from 'graphql/utilities';

// Urql will console warn this for any entities that don't return id:
//   Invalid key: The GraphQL query at the field at `...` has a selection set, but no key could be generated for the data at this field.
//   You have to request `id` or `_id` fields for all selection sets or create a custom `keys` config for `TaskPage`.
//   Entities without keys will be embedded directly on the parent entity. If this is intentional, create a `keys` config for `TaskPage` that always returns null.
// Since our paginated pages don't have id, the following logic will add key of null to them.
// Warning: This will likely remove warnings that you missed returning id for something that should have one but
// going to trust that this is being considered, linted, reviewed so we can be more automated here and not manually
// whitelist every paginated page ever made.
// https://formidable.com/open-source/urql/docs/graphcache/cache-updates/#updating-many-unknown-links

export interface CacheExchangeOptions extends CacheExchangeOpts {}

function getTypeNames(schema: any): string[] {
  return schema.__schema.types
    .filter((type: IntrospectionObjectType) => type.kind === 'OBJECT')
    .filter((type: IntrospectionObjectType) => !['Query', 'Mutation'].includes(type.name))
    .map((type: IntrospectionObjectType) => type.name);
}

function generateKeys(
  schema: any,
  typeNames: string[]
): Record<string, (data: Data) => string | null> {
  const keys: Record<string, (data: Data) => string | null> = {};

  typeNames.forEach((typeName) => {
    const type = schema.__schema.types.find((t: IntrospectionObjectType) => t.name === typeName);

    if (type && !type.fields.some((field: any) => ['id', '_id'].includes(field.name))) {
      keys[typeName] = () => null;
    }
  });

  return keys;
}

export function createCacheExchange(options: CacheExchangeOptions): Exchange {
  const { schema, ...remainingOptions } = options;

  const typeNames = getTypeNames(schema);
  const keys = generateKeys(schema, typeNames);

  return cacheExchange({
    schema,
    keys,
    ...remainingOptions,
  });
}

export { type Cache, type Exchange };
