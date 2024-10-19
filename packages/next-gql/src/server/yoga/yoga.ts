/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useGenericAuth as serverUseGenericAuth } from "@envelop/generic-auth";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { useAPQ as serverUseAPQ } from "@graphql-yoga/plugin-apq";
import { useCSRFPrevention as serverUseCSRFPrevention } from "@graphql-yoga/plugin-csrf-prevention";
import type { ChannelPubSubConfig } from "@graphql-yoga/subscription/typings/create-pub-sub";
import { initContextCache } from "@pothos/core";
import { GraphQLError } from "graphql";
import {
	type CORSOptions,
	type GraphiQLOptions,
	type Plugin,
	type PubSub,
	type YogaInitialContext,
	type YogaServerInstance,
	type YogaServerOptions,
	createPubSub,
	createYoga,
	maskError,
} from "graphql-yoga";

type PubSubPublishArgsByKey = {
	// biome-ignore lint/suspicious/noExplicitAny: ok
	[key: string]: [] | [any] | [number | string, any];
};

export interface YogaContext<
	TUser,
	TPubSubChannels extends PubSubPublishArgsByKey,
> {
	currentUser?: TUser;
	pubSub: PubSub<TPubSubChannels>;
}

export interface YogaConfiguration<
	TUser = unknown,
	TPubSubChannels extends PubSubPublishArgsByKey = Record<string, never>,
	// biome-ignore lint/suspicious/noExplicitAny: ok
> extends YogaServerOptions<any, any> {
	logError?: (message: string) => void;
	handleCreateOrGetUser?: (req: Request) => Promise<TUser | null>;
	pubSubOverride?: PubSub<TPubSubChannels>;
	pubSubConfig?: ChannelPubSubConfig<TPubSubChannels> | undefined;
	// biome-ignore lint/suspicious/noExplicitAny: ok
	graphQLArmorConfig?: any;
}

export function makeServer<
	TUser,
	TPubSubChannels extends PubSubPublishArgsByKey = Record<string, never>,
>(
	config: YogaConfiguration<TUser, TPubSubChannels>,
): YogaServerInstance<
	// biome-ignore lint/suspicious/noExplicitAny: ok
	Record<string, any>,
	YogaContext<TUser, TPubSubChannels>
> {
	const {
		handleCreateOrGetUser,
		logError,
		pubSubOverride,
		pubSubConfig,
		graphQLArmorConfig,
		...yogaOptions
	} = config;

	const pubSub = createPubSub<TPubSubChannels>(pubSubConfig);

	// biome-ignore lint/suspicious/noExplicitAny: TBD
	const defaultPlugins: Array<Plugin<any, any, any>> = [
		serverUseCSRFPrevention({
			requestHeaders: ["x-graphql-csrf"],
		}),
		serverUseGenericAuth({
			mode: "resolve-only",
			async resolveUserFn(context: YogaInitialContext): Promise<TUser | null> {
				if (handleCreateOrGetUser) {
					return handleCreateOrGetUser(context.request);
				}
				throw new Error("No user resolution handler provided.");
			},
		}),
		EnvelopArmorPlugin({
			// Avoid "Query depth limit of 6 exceeded, found 7." error in current structure
			maxDepth: {
				flattenFragments: true,
			},
			...graphQLArmorConfig,
		}),
		serverUseAPQ(),
	];

	// Next.js Custom Route Handler: https://nextjs.org/docs/app/building-your-application/routing/router-handlers
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return createYoga<unknown, YogaContext<TUser>>({
		plugins: defaultPlugins, // Yoga needs to know how to create a valid Next response
		batching: true,
		context: ({
			request,
		}: { request: Request }): Partial<YogaContext<TUser, TPubSubChannels>> => ({
			// Adding this will prevent any issues if you server implementation
			// copies or extends the context object before passing it to your resolvers
			// https://pothos-graphql.dev/docs/guide/context#initialize-context-cache
			...initContextCache(),

			pubSub: pubSubOverride || pubSub,
		}),
		// Although gql spec says everything should be 200, mapping some to semantic HTTP error codes
		// https://escape.tech/blog/graphql-errors-the-good-the-bad-and-the-ugly/
		fetchAPI: { Response },
		...yogaOptions,
		graphiql: {
			headers: JSON.stringify({
				"x-graphql-csrf": "true",
			}),
			...(yogaOptions.graphiql as GraphiQLOptions),
		},
		cors: {
			//origin: process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : env.NEXT_PUBLIC_REDIRECT_URL,
			credentials: true,
			allowedHeaders: ["x-graphql-csrf", "authorization"],
			methods: ["POST"],
			...(yogaOptions.cors as CORSOptions),
		},
		maskedErrors:
			yogaOptions.maskedErrors !== undefined
				? yogaOptions.maskedErrors
				: {
						maskError(
							error: Error,
							message: string,
							isDev: boolean | undefined,
						) {
							if (error instanceof GraphQLError) {
								if (error?.extensions?.code) {
									if (error?.extensions?.code === "PERSISTED_QUERY_NOT_FOUND") {
										// Modify the status code from 404 which shows in console to something more benign
										return {
											...error,
											extensions: {
												...error.extensions,
												http: { ...error.extensions.http, status: 200 },
											},
										};
									}

									return error;
								}

								// Return code and 500 status for unexpected errors (without code already)
								const newError = new GraphQLError(message, {
									nodes: error.nodes,
									source: error.source,
									positions: error.positions,
									path: error.path,
									originalError: error.originalError,
									extensions: {
										code: "SERVER_ERROR",
										http: { status: 500 },
									},
								});

								if (logError) {
									logError(error?.message || message);
								}

								return maskError(newError, message, isDev);
							}
							return maskError(error, message, isDev);
						},
					},
	});
}
