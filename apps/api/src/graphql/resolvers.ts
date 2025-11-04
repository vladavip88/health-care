import { resolvers as scalarResolvers } from 'graphql-scalars';
import { userResolver } from '../modules/user/user.resolver';
import { authResolver } from '../modules/auth/auth.resolver';
import { clinicResolver } from '../modules/clinic/clinic.resolver';
import { doctorResolver } from '../modules/doctor/doctor.resolver';
import { assistantResolver } from '../modules/assistant/assistant.resolver';
import { patientResolver } from '../modules/patient/patient.resolver';
import { appointmentResolver } from '../modules/appointment/appointment.resolver';
import { weeklySlotResolver } from '../modules/weeklySlot/weeklySlot.resolver';
import { reminderResolver } from '../modules/reminder/reminder.resolver';
import { webhookEndpointResolver } from '../modules/webhookEndpoint/webhookEndpoint.resolver';
import { auditLogResolver } from '../modules/auditLog/auditLog.resolver';
import { mergeResolvers } from '@graphql-tools/merge';

/**
 * Combined resolvers
 * Merges all module resolvers into a single resolver object
 */
export const resolvers = mergeResolvers([
  scalarResolvers,
  userResolver,
  authResolver,
  clinicResolver,
  doctorResolver,
  assistantResolver,
  patientResolver,
  appointmentResolver,
  weeklySlotResolver,
  reminderResolver,
  webhookEndpointResolver,
  auditLogResolver,
]);
