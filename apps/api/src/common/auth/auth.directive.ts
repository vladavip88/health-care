import { defaultFieldResolver, GraphQLError } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import type { GraphQLSchema } from 'graphql';

/**
 * @auth directive - Ensures user is authenticated
 * Usage: @auth
 */
export function authDirective(directiveName = 'auth') {
  return (schema: GraphQLSchema) => {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

        if (authDirective) {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            if (!context.user) {
              throw new GraphQLError('Unauthorized: User not authenticated', {
                extensions: { code: 'UNAUTHENTICATED' },
              });
            }

            return resolve(source, args, context, info);
          };
        }

        return fieldConfig;
      },
    });
  };
}
