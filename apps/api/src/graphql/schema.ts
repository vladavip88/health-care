import gql from 'graphql-tag';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';
import { userSchema } from '../modules/user/user.schema';
import { authSchema } from '../modules/auth/auth.schema';
import { clinicSchema } from '../modules/clinic/clinic.schema';
import doctorSchema from '../modules/doctor/doctor.schema';
import assistantSchema from '../modules/assistant/assistant.schema';
import patientSchema from '../modules/patient/patient.schema';
import appointmentSchema from '../modules/appointment/appointment.schema';
import weeklySlotSchema from '../modules/weeklySlot/weeklySlot.schema';
import reminderSchema from '../modules/reminder/reminder.schema';
import webhookEndpointSchema from '../modules/webhookEndpoint/webhookEndpoint.schema';
import auditLogSchema from '../modules/auditLog/auditLog.schema';

/**
 * Root schema with base Query and Mutation types
 * Individual modules extend these base types
 */
const baseSchema = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

/**
 * Combined type definitions
 * Includes base schema, scalar type definitions from graphql-scalars, and all module schemas
 */
export const typeDefs = [
  baseSchema,
  scalarTypeDefs,
  userSchema,
  authSchema,
  clinicSchema,
  doctorSchema,
  assistantSchema,
  patientSchema,
  appointmentSchema,
  weeklySlotSchema,
  reminderSchema,
  webhookEndpointSchema,
  auditLogSchema,
];
