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

      // Initialize all DataLoaders (unique per request)
      return {
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
