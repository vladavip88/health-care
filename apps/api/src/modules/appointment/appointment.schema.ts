import gql from 'graphql-tag';

export default gql`
  enum AppointmentStatus {
    PENDING
    CONFIRMED
    CANCELLED
    NOSHOW
    COMPLETED
  }

  enum AppointmentSource {
    ADMIN_PORTAL
    PATIENT_PORTAL
    GOOGLE_CALENDAR
    API
  }

  type Appointment {
    id: ID!
    clinicId: ID!
    doctorId: ID!
    patientId: ID!
    start: DateTime!
    end: DateTime!
    status: AppointmentStatus!
    source: AppointmentSource!
    reason: String
    notes: String
    gcalEventId: String
    createdById: ID
    createdAt: DateTime!
    updatedAt: DateTime!

    # Relations
    clinic: Clinic!
    doctor: Doctor!
    patient: Patient!
    createdBy: User
    reminders: [Reminder!]!
    auditLogs: [AuditLog!]!
  }

  input CreateAppointmentInput {
    doctorId: ID!
    patientId: ID!
    start: DateTime!
    end: DateTime!
    reason: String
    notes: String
    status: AppointmentStatus
    source: AppointmentSource
  }

  input UpdateAppointmentInput {
    start: DateTime
    end: DateTime
    reason: String
    notes: String
    status: AppointmentStatus
  }

  input AppointmentFilterInput {
    doctorId: ID
    patientId: ID
    status: AppointmentStatus
    startDate: DateTime
    endDate: DateTime
  }

  type Query {
    appointments(filter: AppointmentFilterInput): [Appointment!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT", "PATIENT"])

    appointment(id: ID!): Appointment
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT", "PATIENT"])

    myAppointments(filter: AppointmentFilterInput): [Appointment!]!
      @auth
      @hasRole(roles: ["PATIENT"])

    doctorAppointments(doctorId: ID!, filter: AppointmentFilterInput): [Appointment!]!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR", "ASSISTANT"])
  }

  type Mutation {
    createAppointment(data: CreateAppointmentInput!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "appointment:create")

    updateAppointment(id: ID!, data: UpdateAppointmentInput!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "appointment:update")

    cancelAppointment(id: ID!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "PATIENT"])
      @hasPermission(permission: "appointment:cancel")

    confirmAppointment(id: ID!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT"])
      @hasPermission(permission: "appointment:update")

    completeAppointment(id: ID!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "DOCTOR"])
      @hasPermission(permission: "appointment:update")

    markNoShow(id: ID!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN", "ASSISTANT", "DOCTOR"])
      @hasPermission(permission: "appointment:update")

    deleteAppointment(id: ID!): Appointment!
      @auth
      @hasRole(roles: ["CLINIC_ADMIN"])
      @hasPermission(permission: "appointment:delete")
  }
`;
