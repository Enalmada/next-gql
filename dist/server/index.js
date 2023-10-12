// serverrver/yoga.ts
import {useGenericAuth} from "@envelop/generic-auth";
import {EnvelopArmorPlugin} from "@escape.tech/graphql-armor";
import {useAPQ} from "@graphql-yoga/plugin-apq";
import {useCSRFPrevention} from "@graphql-yoga/plugin-csrf-prevention";
import {
createYoga
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
    maskedErrors: true
  });
}
export {
  makeServer
};
