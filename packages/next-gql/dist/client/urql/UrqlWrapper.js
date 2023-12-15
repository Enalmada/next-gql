'use client';

// src/client/urql/UrqlWrapper.tsx
import {useMemo} from "react";
import {yogaExchange} from "@graphql-yoga/urql-exchange";
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
  return jsxDEV(UrqlProvider, {
    client,
    ssr,
    nonce,
    children
  }, undefined, false, undefined, this);
}
import {
jsxDEV
} from "react/jsx-dev-runtime";

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
