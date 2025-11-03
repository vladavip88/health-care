import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { prisma } from './lib/prisma';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { directiveTypeDefs } from './graphql/directives';
import { authDirective } from './common/auth/auth.directive';
import { roleDirective } from './common/auth/role.directive';
import { permissionDirective } from './common/auth/permission.directive';
import { authenticateUser } from './common/auth/auth.middleware';
import type { Context } from './common/types/context';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Create executable schema with directives
let schema = makeExecutableSchema({
  typeDefs: [directiveTypeDefs, typeDefs],
  resolvers,
});

// Apply directive transformers
schema = authDirective('auth')(schema);
schema = roleDirective('hasRole')(schema);
schema = permissionDirective('hasPermission')(schema);

// Initialize Apollo Server
const server = new ApolloServer<Context>({
  schema,
});

// Start function to initialize Apollo Server
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async ({ req }) => {
      // Authenticate user from Authorization header
      const user = await authenticateUser(req.headers.authorization);

      return {
        prisma,
        user: user || undefined,
        clinicId: user?.clinicId,
      };
    },
  });

  console.log(`[ ready ] ${url}`);
  console.log(`[ graphql ] ${url}`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
