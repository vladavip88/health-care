import { ApolloServer } from '@apollo/server';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { prisma } from './lib/prisma';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { directiveTypeDefs } from './graphql/directives';
import { authDirective } from './common/auth/auth.directive';
import { roleDirective } from './common/auth/role.directive';
import { permissionDirective } from './common/auth/permission.directive';
import { authenticateUser } from './common/auth/auth.middleware';
import type { Context } from './common/types/context';

// Import all DataLoader factories
import { createClinicLoader } from './modules/clinic/clinic.dataloader';
import { createUserLoader } from './modules/user/user.dataloader';
import { createDoctorLoader, createDoctorByUserIdLoader } from './modules/doctor/doctor.dataloader';
import { createAssistantLoader, createAssistantByUserIdLoader } from './modules/assistant/assistant.dataloader';
import { createPatientLoader, createPatientByUserIdLoader } from './modules/patient/patient.dataloader';
import {
  createAppointmentLoader,
  createAppointmentsByDoctorLoader,
  createAppointmentsByPatientLoader,
} from './modules/appointment/appointment.dataloader';
import { createWeeklySlotLoader, createWeeklySlotsByDoctorLoader } from './modules/weeklySlot/weeklySlot.dataloader';
import {
  createReminderLoader,
  createRemindersByAppointmentLoader,
  createReminderRuleLoader,
} from './modules/reminder/reminder.dataloader';
import { auditLogRepository } from './modules/auditLog/auditLog.repository';

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

// Start function to initialize Apollo Server with Express
async function startServer() {
  const app = express();

  // Configure CORS - allow all origins for development
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200,
    })
  );

  // Parse JSON bodies
  app.use(json());

  // Start Apollo Server
  await server.start();

  // Handle GraphQL requests
  app.post('/graphql', async (req: Request, res: Response) => {
    try {
      const body = req.body as { query: string; variables?: Record<string, unknown>; operationName?: string };

      // Authenticate user from Authorization header
      const user = await authenticateUser(req.headers.authorization as string);

      // Initialize audit log repository
      const auditRepo = auditLogRepository(prisma);

      // Initialize all DataLoaders (unique per request)
      const context: Context = {
        prisma,
        user: user || undefined,
        clinicId: user?.clinicId,
        loaders: {
          clinic: createClinicLoader(prisma),
          user: createUserLoader(prisma),
          doctor: createDoctorLoader(prisma),
          doctorByUserId: createDoctorByUserIdLoader(prisma),
          assistant: createAssistantLoader(prisma),
          assistantByUserId: createAssistantByUserIdLoader(prisma),
          patient: createPatientLoader(prisma),
          patientByUserId: createPatientByUserIdLoader(prisma),
          appointment: createAppointmentLoader(prisma),
          appointmentsByDoctor: createAppointmentsByDoctorLoader(prisma),
          appointmentsByPatient: createAppointmentsByPatientLoader(prisma),
          weeklySlot: createWeeklySlotLoader(prisma),
          weeklySlotsByDoctor: createWeeklySlotsByDoctorLoader(prisma),
          reminder: createReminderLoader(prisma),
          remindersByAppointment: createRemindersByAppointmentLoader(prisma),
          reminderRule: createReminderRuleLoader(prisma),
        },
        audit: {
          log: async (params) => {
            try {
              await auditRepo.create({
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                metadata: params.metadata,
                clinic: { connect: { id: params.clinicId } },
                actor: params.actorId ? { connect: { id: params.actorId } } : undefined,
                appointment: params.appointmentId ? { connect: { id: params.appointmentId } } : undefined,
              });
            } catch (error) {
              // Log errors but don't throw - audit logging should never break the main operation
              console.error('Failed to create audit log:', error);
            }
          },
        },
      };

      // Execute GraphQL query
      const result = await server.executeOperation(
        {
          query: body.query,
          variables: body.variables,
          operationName: body.operationName,
        },
        { contextValue: context }
      );

      // Extract the actual GraphQL result from the Apollo response
      if (result.body.kind === 'single') {
        res.json(result.body.singleResult);
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error('GraphQL error:', error);
      res.status(500).json({ errors: [{ message: 'Internal Server Error' }] });
    }
  });

  // Handle GET requests for health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Start Express server
  const httpServer = app.listen(port, () => {
    console.log(`[ ready ] http://localhost:${port}`);
    console.log(`[ graphql ] http://localhost:${port}/graphql`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    httpServer.close();
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down gracefully...');
    await server.stop();
    httpServer.close();
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
