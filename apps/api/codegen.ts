import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    `
    scalar DateTime
    scalar JSON
    scalar BigInt
    `,
    'src/**/*.schema.ts',
  ],
  generates: {
    './src/generated/schema.types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
