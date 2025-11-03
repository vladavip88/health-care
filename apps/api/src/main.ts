import { ApolloServer, BaseContext } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { prisma } from './lib/prisma';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Initialize Apollo Server
const server = new ApolloServer<BaseContext>({
  typeDefs,
  resolvers,
});

// Start function to initialize Apollo Server
async function startServer() {
  const { url } = await startStandaloneServer(server, {
    listen: { port },
    context: async () => ({
      prisma,
    }),
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
