/**
 * Fine-grained permissions for the platform
 * These can be assigned to users based on their role
 */
export const PERMISSIONS = {
  // User permissions
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // Appointment permissions
  APPOINTMENT_READ: 'appointment:read',
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_UPDATE: 'appointment:update',
  APPOINTMENT_CANCEL: 'appointment:cancel',
  APPOINTMENT_DELETE: 'appointment:delete',

  // Patient permissions
  PATIENT_READ: 'patient:read',
  PATIENT_CREATE: 'patient:create',
  PATIENT_UPDATE: 'patient:update',
  PATIENT_DELETE: 'patient:delete',

  // Doctor permissions
  DOCTOR_READ: 'doctor:read',
  DOCTOR_CREATE: 'doctor:create',
  DOCTOR_UPDATE: 'doctor:update',
  DOCTOR_DELETE: 'doctor:delete',

  // Clinic permissions
  CLINIC_READ: 'clinic:read',
  CLINIC_UPDATE: 'clinic:update',
  CLINIC_SETTINGS: 'clinic:settings',

  // Reminder permissions
  REMINDER_READ: 'reminder:read',
  REMINDER_CREATE: 'reminder:create',
  REMINDER_UPDATE: 'reminder:update',
  REMINDER_DELETE: 'reminder:delete',

  // Webhook permissions
  WEBHOOK_READ: 'webhook:read',
  WEBHOOK_CREATE: 'webhook:create',
  WEBHOOK_UPDATE: 'webhook:update',
  WEBHOOK_DELETE: 'webhook:delete',

  // Audit log permissions
  AUDIT_READ: 'audit:read',
} as const;

/**
 * Role-based permission mapping
 * Defines which permissions each role has by default
 */
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  CLINIC_ADMIN: [
    // Full access to everything
    ...Object.values(PERMISSIONS),
  ],

  DOCTOR: [
    // Can read patients and manage own appointments
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CANCEL,
    PERMISSIONS.DOCTOR_READ,
    PERMISSIONS.DOCTOR_UPDATE, // Can update own profile
  ],

  ASSISTANT: [
    // Can manage patients and appointments
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.APPOINTMENT_CREATE,
    PERMISSIONS.APPOINTMENT_UPDATE,
    PERMISSIONS.APPOINTMENT_CANCEL,
    PERMISSIONS.DOCTOR_READ,
  ],

  PATIENT: [
    // Can only read own data
    PERMISSIONS.APPOINTMENT_READ,
    PERMISSIONS.PATIENT_READ,
  ],
};

/**
 * Helper function to get permissions for a role
 */
export function getPermissionsForRole(role: string): string[] {
  return ROLE_PERMISSIONS[role] || [];
}
