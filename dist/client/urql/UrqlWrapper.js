'use client';

// urqlclient/urql/cacheExchange.t
import React, {useMemo} from "react";
import {authExchange} from "@urql/exchange-auth";
import {
cacheExchange,
createClient,
fetchExchange,
ssrExchange,
UrqlProvider
} from "@urql/next";
function UrqlWrapper(props) {
  const {
    url,
    isLoggedIn,
    cookie,
    cacheExchange: cacheExchangeManual,
    nonce,
    children,
    ...clientOptions
  } = props;
  const [client, ssr] = useMemo(() => {
    const auth = createAuth(cookie);
    const ssr2 = ssrExchange();
    const client2 = createClient({
      url,
      exchanges: [
        cacheExchangeManual || cacheExchange,
        auth,
        ssr2,
        fetchExchange
      ],
      suspense: true,
      requestPolicy: "cache-first",
      fetchOptions: {
        headers: {
          "x-graphql-csrf": "true"
        }
      },
      ...clientOptions
    });
    return [client2, ssr2];
  }, [isLoggedIn]);
  return React.createElement(UrqlProvider, {
    client,
    ssr,
    nonce
  }, children);
}
var createAuth = (cookie) => {
  return authExchange(async (utilities) => {
    return {
      addAuthToOperation(operation) {
        const isSSR = typeof window === "undefined";
        if (!isSSR || !cookie)
          return operation;
        return utilities.appendHeaders(operation, {
          cookie
        });
      },
      didAuthError(error) {
        return error.graphQLErrors.some((e) => e.extensions?.code === "UNAUTHORIZED");
      },
      refreshAuth: async () => {
      }
    };
  });
};
export {
  UrqlWrapper
};
