/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/ban-ts-comment */

// https://pothos-graphql.dev/docs/plugins/prisma
// https://www.prisma.io/blog/e2e-type-safety-graphql-react-3-fbV2ZVIGWg#define-a-date-scalar-type
import WithInputPlugin from '@pothos/plugin-with-input';
import { DateTimeResolver, JSONResolver, NonEmptyStringResolver } from 'graphql-scalars';

export interface DefaultScalars {
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
    JSON: {
      Input: unknown;
      Output: unknown;
    };
    NonEmptyString: {
      Input: string;
      Output: string;
    };
    File: {
      Input: File;
      Output: never;
    };
  };
}

export const defaultBuilderOptions = {
  plugins: [WithInputPlugin],
};

export function initializeBuilder(
  builder: PothosSchemaTypes.SchemaBuilder<PothosSchemaTypes.ExtendDefaultTypes<any>>
): void {
  builder.addScalarType('DateTime' as any, DateTimeResolver, {});
  builder.addScalarType('JSON' as any, JSONResolver, {});
  builder.addScalarType('NonEmptyString' as any, NonEmptyStringResolver, {});

  builder.scalarType('File', {
    serialize: () => {
      throw new Error('Uploads can only be used as input types');
    },
  });

  builder.queryType({
    description: 'The query root type.',
  });

  builder.mutationType({
    description: 'The query mutation type.',
  });
}

// Complexity taken care of by armor. Use here if not there
// https://escape.tech/graphql-armor/
// https://pothos-graphql.dev/docs/plugins/complexity
/*
const complexity = {
  defaultComplexity: 1,
  defaultListMultiplier: 10,
  limit: {
    complexity: 500,
    depth: 10,
    breadth: 50,
  },
};
 */

/*
interface DefaultScalars {
  DateTime: {
    Input: Date;
    Output: Date;
  };
  JSON: {
    Input: unknown;
    Output: unknown;
  };
  NonEmptyString: {
    Input: string;
    Output: string;
  };
}

interface DefaultSchemaTypes {
  Scalars: DefaultScalars;
}

export function createSchemaBuilder<
  T extends { Scalars: Partial<DefaultScalars> },
  C extends object,
>(): InstanceType<
  typeof SchemaBuilder<DefaultSchemaTypes & { Scalars: T['Scalars']; Context: C }>
> {
  type UserTypes = {
    Scalars: T['Scalars'];
    Context: C;
  };

  // This ensures that the merged type satisfies the required constraints.
  type MergedSchemaTypes = DefaultSchemaTypes & UserTypes;

  const builder = new SchemaBuilder<MergedSchemaTypes>({
    plugins: [WithInputPlugin],
  });

  builder.addScalarType('DateTime', DateTimeResolver, {});
  builder.addScalarType('JSON', JSONResolver, {});
  builder.addScalarType('NonEmptyString', NonEmptyStringResolver, {});

  builder.queryType({
    description: 'The query root type.',
  });

  builder.mutationType({
    description: 'The query mutation type.',
  });

  return builder as unknown as InstanceType<
    typeof SchemaBuilder<DefaultSchemaTypes & { Scalars: T['Scalars']; Context: C }>
  >;
}

 */

/*
errorOptions: {
  directResult: true,
  defaultTypes: [Error],
},
 */

/*
const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

builder.objectType(UnauthorizedError, {
  name: 'UnauthorizedError',
  interfaces: [ErrorInterface],
});

builder.objectType(NotFoundError, {
  name: 'NotFoundError',
  interfaces: [ErrorInterface],
});
 */
