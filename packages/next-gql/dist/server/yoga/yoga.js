// src/server/yoga/yoga.ts
import { useGenericAuth as serverUseGenericAuth } from "@envelop/generic-auth";
import { EnvelopArmorPlugin } from "@escape.tech/graphql-armor";
import { useAPQ as serverUseAPQ } from "@graphql-yoga/plugin-apq";
import { useCSRFPrevention as serverUseCSRFPrevention } from "@graphql-yoga/plugin-csrf-prevention";
import { initContextCache } from "@pothos/core";
import { GraphQLError } from "graphql";
import {
  createPubSub,
  createYoga,
  maskError
} from "graphql-yoga";
function makeServer(config) {
  const {
    handleCreateOrGetUser,
    logError,
    pubSubOverride,
    pubSubConfig,
    graphQLArmorConfig,
    ...yogaOptions
  } = config;
  const pubSub = createPubSub(pubSubConfig);
  const defaultPlugins = [
    serverUseCSRFPrevention({
      requestHeaders: ["x-graphql-csrf"]
    }),
    serverUseGenericAuth({
      mode: "resolve-only",
      async resolveUserFn(context) {
        if (handleCreateOrGetUser) {
          return handleCreateOrGetUser(context.request);
        }
        throw new Error("No user resolution handler provided.");
      }
    }),
    EnvelopArmorPlugin({
      maxDepth: {
        flattenFragments: true
      },
      ...graphQLArmorConfig
    }),
    serverUseAPQ()
  ];
  return createYoga({
    plugins: defaultPlugins,
    batching: true,
    context: ({
      request
    }) => ({
      ...initContextCache(),
      pubSub: pubSubOverride || pubSub
    }),
    fetchAPI: { Response },
    ...yogaOptions,
    graphiql: {
      headers: JSON.stringify({
        "x-graphql-csrf": "true"
      }),
      ...yogaOptions.graphiql
    },
    cors: {
      credentials: true,
      allowedHeaders: ["x-graphql-csrf", "authorization"],
      methods: ["POST"],
      ...yogaOptions.cors
    },
    maskedErrors: yogaOptions.maskedErrors !== undefined ? yogaOptions.maskedErrors : {
      maskError(error, message, isDev) {
        if (error instanceof GraphQLError) {
          if (error?.extensions?.code) {
            if (error?.extensions?.code === "PERSISTED_QUERY_NOT_FOUND") {
              return {
                ...error,
                extensions: {
                  ...error.extensions,
                  http: { ...error.extensions.http, status: 200 }
                }
              };
            }
            return error;
          }
          const newError = new GraphQLError(message, {
            nodes: error.nodes,
            source: error.source,
            positions: error.positions,
            path: error.path,
            originalError: error.originalError,
            extensions: {
              code: "SERVER_ERROR",
              http: { status: 500 }
            }
          });
          if (logError) {
            logError(error?.message || message);
          }
          return maskError(newError, message, isDev);
        }
        return maskError(error, message, isDev);
      }
    }
  });
}
export {
  makeServer
};
