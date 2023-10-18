'use client';

// urqlclient/urql/cacheExchange.ts
import {
cacheExchange
} from "@urql/exchange-graphcache";
var getTypeNames = function(schema) {
  return schema.__schema.types.filter((type) => type.kind === "OBJECT").filter((type) => !["Query", "Mutation"].includes(type.name)).map((type) => type.name);
};
var generateKeys = function(schema, typeNames) {
  const keys = {};
  typeNames.forEach((typeName) => {
    const type = schema.__schema.types.find((t) => t.name === typeName);
    if (type && !type.fields.some((field) => ["id", "_id"].includes(field.name))) {
      keys[typeName] = () => null;
    }
  });
  return keys;
};
function createCacheExchange(options) {
  const { schema, ...remainingOptions } = options;
  const typeNames = getTypeNames(schema);
  const keys = generateKeys(schema, typeNames);
  return cacheExchange({
    schema,
    keys,
    ...remainingOptions
  });
}
export {
  createCacheExchange
};
