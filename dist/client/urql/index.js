// urqlclient/urql/gql.tsxc
import {useMutation, useQuery, useSubscription} from "@urql/next";

// urqlclient/urql/gql.ts
import {gql as originalGql} from "@urql/core";
var gql = function(strings, ...interpolations) {
  return originalGql(strings, ...interpolations);
};
export {
  useSubscription,
  useQuery,
  useMutation,
  gql
};
