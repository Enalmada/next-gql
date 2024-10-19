'use client';

// src/client/urql/UrqlWrapper.tsx
import { yogaExchange } from "@graphql-yoga/urql-exchange";
import { authExchange } from "@urql/exchange-auth";
import {
  UrqlProvider,
  cacheExchange,
  createClient,
  fetchExchange,
  ssrExchange
} from "@urql/next";
import React, { useMemo } from "react";

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
        fetchExchange,
        yogaExchange()
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
  return /* @__PURE__ */ React.createElement(UrqlProvider, {
    client,
    ssr,
    nonce
  }, children);
}
export {
  UrqlWrapper
};
