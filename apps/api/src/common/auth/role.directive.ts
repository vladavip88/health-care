import { defaultFieldResolver, GraphQLError } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import type { GraphQLSchema } from 'graphql';

/**
 * @hasRole directive - Ensures user has one of the required roles
 * Usage: @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
 */
export function roleDirective(directiveName = 'hasRole') {
  return (schema: GraphQLSchema) => {
    return mapSchema(schema, {
      [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
        const roleDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

        if (roleDirective) {
          const allowedRoles = roleDirective.roles || [];
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (source, args, context, info) {
            if (!context.user) {
              throw new GraphQLError('Unauthorized: User not authenticated', {
                extensions: { code: 'UNAUTHENTICATED' },
              });
            }

            if (!allowedRoles.includes(context.user.role)) {
              throw new GraphQLError('Forbidden: Insufficient role', {
                extensions: {
                  code: 'FORBIDDEN',
                  requiredRoles: allowedRoles,
                  userRole: context.user.role,
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
