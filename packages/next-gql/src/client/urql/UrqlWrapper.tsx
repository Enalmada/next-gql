"use client";

import { yogaExchange } from "@graphql-yoga/urql-exchange";
import { type AuthUtilities, authExchange } from "@urql/exchange-auth";
import {
	type ClientOptions,
	type CombinedError,
	type Exchange,
	type Operation,
	UrqlProvider,
	cacheExchange,
	createClient,
	fetchExchange,
	ssrExchange,
} from "@urql/next";
import React, { useMemo, type ReactNode } from "react";

// https://github.com/JoviDeCroock/urql/blob/next-13-package/examples/with-next/app/non-rsc/layout.tsx

interface UrqlWrapperProps extends Partial<ClientOptions> {
	url: string;
	isLoggedIn: boolean;
	cookie?: string | null;
	children: ReactNode;
	cacheExchange?: Exchange;
	nonce?: string;
}

const createAuth = (cookie: string | null | undefined): Exchange => {
	// Although no current operations are async, it is a required attribute
	// eslint-disable-next-line @typescript-eslint/require-await
	return authExchange(async (utilities: AuthUtilities) => {
		return {
			addAuthToOperation(operation: Operation) {
				const isSSR = typeof window === "undefined";

				if (!isSSR || !cookie) return operation;

				// Add cookies during SSR since they are not automatically passed along
				return utilities.appendHeaders(operation, {
					cookie,
				});
			},
			didAuthError(error: CombinedError) {
				// TODO review if this is ever triggered and how to respond
				return error.graphQLErrors.some(
					(e) => e.extensions?.code === "UNAUTHORIZED",
				);
			},
			refreshAuth: async () => {}, // no-op but refreshAuth is required param
		};
	});
};

export function UrqlWrapper(props: UrqlWrapperProps) {
	const {
		url,
		isLoggedIn,
		cookie,
		cacheExchange: cacheExchangeManual,
		nonce,
		children,
		...clientOptions
	} = props;

	// biome-ignore lint/correctness/useExhaustiveDependencies: TBD
	const [client, ssr] = useMemo(() => {
		const auth = createAuth(cookie);

		const ssr = ssrExchange();

		// https://the-guild.dev/graphql/sse/recipes#with-urql
		// https://github.com/enisdenjo/graphql-sse/blob/master/PROTOCOL.md#distinct-connections-mode
		/*
    const sseClient = createSSEClient({
      url: url,
      headers: {
        // https://the-guild.dev/graphql/yoga-server/docs/features/csrf-prevention
        'x-graphql-csrf': 'true',
      },
    });

     */

		const client = createClient({
			url,
			exchanges: [
				cacheExchangeManual || cacheExchange,
				auth,
				ssr,
				/*
        // Fills console with ERR GraphQLError: PersistedQueryNotFound
        // TODO figure out how to avoid console errors with this on
        persistedExchange({
          enforcePersistedQueries: false,
          preferGetForPersistedQueries: false,
          enableForMutation: true,
        }),
         */
				fetchExchange,
				yogaExchange(),
				/*
        subscriptionExchange({
          forwardSubscription(operation) {
            return {
              subscribe: (sink) => {
                // @ts-expect-error Argument of type 'FetchBody' is not assignable to parameter of type 'RequestParams'
                const dispose = sseClient.subscribe(operation, sink);
                return {
                  unsubscribe: dispose,
                };
              },
            };
          },
        }),

         */
			],
			suspense: true,
			requestPolicy: "cache-first",
			fetchOptions: {
				headers: {
					// https://the-guild.dev/graphql/yoga-server/docs/features/csrf-prevention
					"x-graphql-csrf": "true",
				},
			},
			...clientOptions,
		});

		return [client, ssr];

		// adding cookies will cause unnecessary rerender as it can change for same user
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoggedIn]);

	return (
		<UrqlProvider client={client} ssr={ssr} nonce={nonce}>
			{children}
		</UrqlProvider>
	);
}
