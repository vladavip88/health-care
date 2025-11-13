import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    `
    scalar DateTime
    scalar JSON
    scalar BigInt
    `,
    '../api/src/**/*.schema.ts',
  ],
  documents: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.d.ts',
    '!src/generated/**',
    '!src/apollo/hooks/**',
  ],
  generates: {
    './src/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
