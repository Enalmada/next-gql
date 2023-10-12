// serverrver/yoga.ts
import {useGenericAuth} from "@envelop/generic-auth";
import {EnvelopArmorPlugin} from "@escape.tech/graphql-armor";
import {useAPQ} from "@graphql-yoga/plugin-apq";
import {useCSRFPrevention} from "@graphql-yoga/plugin-csrf-prevention";
import {GraphQLError} from "graphql";
import {
createYoga,
maskError
} from "graphql-yoga";
function makeServer(config) {
  const { handleCreateOrGetUser, logError, ...yogaOptions } = config;
  const defaultPlugins = [
    useCSRFPrevention({
      requestHeaders: ["x-graphql-csrf"]
    }),
    useGenericAuth({
      mode: "resolve-only",
      async resolveUserFn(context) {
        if (handleCreateOrGetUser) {
          return handleCreateOrGetUser(context.request);
        }
        throw new Error("No user resolution handler provided.");
      }
    }),
    EnvelopArmorPlugin(),
    useAPQ()
  ];
  return createYoga({
    plugins: defaultPlugins,
    batching: true,
    context: ({ request }) => {
    },
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
          logError && logError(error?.message || message);
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
