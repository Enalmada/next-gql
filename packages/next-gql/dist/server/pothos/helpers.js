// src/server/pothos/helpers.ts
import WithInputPlugin from "@pothos/plugin-with-input";
import {DateTimeResolver, JSONResolver, NonEmptyStringResolver} from "graphql-scalars";
function initializeBuilder(builder) {
  builder.addScalarType("DateTime", DateTimeResolver, {});
  builder.addScalarType("JSON", JSONResolver, {});
  builder.addScalarType("NonEmptyString", NonEmptyStringResolver, {});
  builder.queryType({
    description: "The query root type."
  });
  builder.mutationType({
    description: "The query mutation type."
  });
}
var defaultBuilderOptions = {
  plugins: [WithInputPlugin]
};
export {
  initializeBuilder,
  defaultBuilderOptions
};
