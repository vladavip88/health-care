import { defaultFieldResolver, GraphQLError } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import type { GraphQLSchema } from 'graphql';

/**
 * @hasPermission directive - Ensures user has specific permission
 * Usage: @hasPermission(permission: "appointment:create")
 */
export function permissionDirective(directiveName = 'hasPermission') {
  return (schema: GraphQLSchema) => {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const permDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

        if (permDirective) {
          const requiredPermission = permDirective.permission;
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            if (!context.user) {
              throw new GraphQLError('Unauthorized: User not authenticated', {
                extensions: { code: 'UNAUTHENTICATED' },
              });
            }

            const userPermissions = context.user.permissions || [];

            if (!userPermissions.includes(requiredPermission)) {
              throw new GraphQLError('Forbidden: Missing required permission', {
                extensions: {
                  code: 'FORBIDDEN',
                  requiredPermission,
                  userPermissions,
                },
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
