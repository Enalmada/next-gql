# next-gql

A collection of graphql best practices and sensible defaults.  The project goals:
* production ready with minimum effort
* config options to underlying technologies (no lockin)

## Getting Started
Read the documentation [website](https://next-gql.vercel.app/)

## Contribute
Using [changesets](https://github.com/changesets/changesets) so please remember to run "changeset" with any PR that might be interesting to people on an older template.

### Development Workflow
Unfortunately bun link seems to have trouble with graphql and updating binaries.  This is the current workaround:
In module, run 'bun lint:fix && bun run build:pack`
In application, run one of as applicable:
* 'bun uninstall @enalmada/next-gql && bun install file:<path>/next-gql/packages/next-gql/enalmada-next-gql-<version>.tgz'
* 'bun uninstall @enalmada/next-gql-codegen && bun install file:<path>/next-gql/packages/next-gql-codegen/enalmada-next-gql-codegen-<version>.tgz'

