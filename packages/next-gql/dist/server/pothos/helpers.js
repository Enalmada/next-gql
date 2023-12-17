// src/server/pothos/helpers.ts
import WithInputPlugin from "@pothos/plugin-with-input";
import {DateTimeResolver, JSONResolver, NonEmptyStringResolver} from "graphql-scalars";
function initializeBuilder(builder) {
  builder.addScalarType("DateTime", DateTimeResolver, {});
  builder.addScalarType("JSON", JSONResolver, {});
  builder.addScalarType("NonEmptyString", NonEmptyStringResolver, {});
  builder.scalarType("File", {
    serialize: () => {
      throw new Error("Uploads can only be used as input types");
    }
  });
  builder.queryType({
    description: "The query root type."
  });
  builder.mutationType({
    description: "The query mutation type."
  });
  builder.subscriptionType({
    description: "The query subscription type."
  });
}
var defaultBuilderOptions = {
  plugins: [WithInputPlugin]
};
export {
  initializeBuilder,
  defaultBuilderOptions
};
