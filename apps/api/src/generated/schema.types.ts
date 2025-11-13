export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type Appointment = {
  __typename?: 'Appointment';
  auditLogs: Array<AuditLog>;
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<User>;
  createdById?: Maybe<Scalars['ID']['output']>;
  doctor: Doctor;
  doctorId: Scalars['ID']['output'];
  end: Scalars['DateTime']['output'];
  gcalEventId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  patient: Patient;
  patientId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reminders: Array<Reminder>;
  source: AppointmentSource;
  start: Scalars['DateTime']['output'];
  status: AppointmentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type AppointmentFilterInput = {
  doctorId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  patientId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<AppointmentStatus>;
};

export type AppointmentSource =
  | 'ADMIN_PORTAL'
  | 'API'
  | 'GOOGLE_CALENDAR'
  | 'PATIENT_PORTAL';

export type AppointmentStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'CONFIRMED'
  | 'NOSHOW'
  | 'PENDING';

export type Assistant = {
  __typename?: 'Assistant';
  active: Scalars['Boolean']['output'];
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  permissions: Array<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export type AuditLog = {
  __typename?: 'AuditLog';
  action: Scalars['String']['output'];
  actor?: Maybe<User>;
  actorId?: Maybe<Scalars['ID']['output']>;
  appointment?: Maybe<Appointment>;
  appointmentId?: Maybe<Scalars['ID']['output']>;
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  entity: Scalars['String']['output'];
  entityId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  ipAddress?: Maybe<Scalars['String']['output']>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type AuditLogFilterInput = {
  action?: InputMaybe<Scalars['String']['input']>;
  actorId?: InputMaybe<Scalars['ID']['input']>;
  appointmentId?: InputMaybe<Scalars['ID']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  entity?: InputMaybe<Scalars['String']['input']>;
  entityId?: InputMaybe<Scalars['ID']['input']>;
  startDate?: InputMaybe<Scalars['DateTime']['input']>;
};

/** Authentication response with user and tokens */
export type AuthResponse = {
  __typename?: 'AuthResponse';
  tokens: AuthTokens;
  user: AuthUser;
};

/** Authentication tokens returned on login/register */
export type AuthTokens = {
  __typename?: 'AuthTokens';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

/** User data in auth response */
export type AuthUser = {
  __typename?: 'AuthUser';
  clinicId: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  role: Role;
};

export type BulkCreateWeeklySlotInput = {
  doctorId: Scalars['ID']['input'];
  slots: Array<WeeklySlotDataInput>;
};

/** Clinic entity representing a medical facility */
export type Clinic = {
  __typename?: 'Clinic';
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  legalName?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  subscriptionPlan?: Maybe<Scalars['String']['output']>;
  subscriptionStatus?: Maybe<Scalars['String']['output']>;
  subscriptionUntil?: Maybe<Scalars['String']['output']>;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

/** Count of related entities in a clinic */
export type ClinicCount = {
  __typename?: 'ClinicCount';
  appointments: Scalars['Int']['output'];
  assistants: Scalars['Int']['output'];
  doctors: Scalars['Int']['output'];
  patients: Scalars['Int']['output'];
  users: Scalars['Int']['output'];
};

/** Clinic statistics */
export type ClinicStats = {
  __typename?: 'ClinicStats';
  appointments: Scalars['Int']['output'];
  assistants: Scalars['Int']['output'];
  doctors: Scalars['Int']['output'];
  patients: Scalars['Int']['output'];
  users: Scalars['Int']['output'];
};

/** Clinic with count statistics */
export type ClinicWithStats = {
  __typename?: 'ClinicWithStats';
  _count?: Maybe<ClinicCount>;
  address?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  legalName?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  subscriptionPlan?: Maybe<Scalars['String']['output']>;
  subscriptionStatus?: Maybe<Scalars['String']['output']>;
  subscriptionUntil?: Maybe<Scalars['String']['output']>;
  timezone: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type CreateAppointmentInput = {
  doctorId: Scalars['ID']['input'];
  end: Scalars['DateTime']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  patientId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  source?: InputMaybe<AppointmentSource>;
  start: Scalars['DateTime']['input'];
  status?: InputMaybe<AppointmentStatus>;
};

export type CreateAssistantInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type CreateAuditLogInput = {
  action: Scalars['String']['input'];
  appointmentId?: InputMaybe<Scalars['ID']['input']>;
  entity: Scalars['String']['input'];
  entityId: Scalars['String']['input'];
  ipAddress?: InputMaybe<Scalars['String']['input']>;
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

/** Input for creating a new clinic */
export type CreateClinicInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  legalName?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  subscriptionPlan?: InputMaybe<Scalars['String']['input']>;
  subscriptionStatus?: InputMaybe<Scalars['String']['input']>;
  subscriptionUntil?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreateDoctorInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  gcalCalendarId?: InputMaybe<Scalars['String']['input']>;
  isAcceptingNewPatients?: InputMaybe<Scalars['Boolean']['input']>;
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  specialty?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['ID']['input'];
};

export type CreatePatientInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  dob?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName: Scalars['String']['input'];
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type CreateReminderRuleInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  channel: ReminderChannel;
  offsetMin: Scalars['Int']['input'];
  template?: InputMaybe<Scalars['String']['input']>;
};

export type CreateWebhookEndpointInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  events: Array<Scalars['String']['input']>;
  secret: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type CreateWeeklySlotInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  doctorId: Scalars['ID']['input'];
  durationMin?: InputMaybe<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
  weekday: Scalars['Int']['input'];
};

export type Doctor = {
  __typename?: 'Doctor';
  appointments: Array<Appointment>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  gcalCalendarId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isAcceptingNewPatients: Scalars['Boolean']['output'];
  languages: Array<Scalars['String']['output']>;
  slots: Array<WeeklySlot>;
  specialty?: Maybe<Scalars['String']['output']>;
  timezone?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

/** Clinic information returned in login response */
export type LoginClinicInfo = {
  __typename?: 'LoginClinicInfo';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Login input */
export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** Login response with user and list of available clinics */
export type LoginResponse = {
  __typename?: 'LoginResponse';
  clinics: Array<LoginClinicInfo>;
  user: AuthUser;
};

export type Mutation = {
  __typename?: 'Mutation';
  activateAssistant: Assistant;
  activateReminderRule: ReminderRule;
  activateWebhookEndpoint: WebhookEndpoint;
  activateWeeklySlot: WeeklySlot;
  bulkCreateWeeklySlots: Array<WeeklySlot>;
  cancelAppointment: Appointment;
  cancelReminder: Reminder;
  completeAppointment: Appointment;
  confirmAppointment: Appointment;
  createAppointment: Appointment;
  createAssistant: Assistant;
  createAuditLog: AuditLog;
  /**
   * Create a new clinic (public)
   * Used during onboarding/registration
   */
  createClinic: Clinic;
  createDoctor: Doctor;
  createPatient: Patient;
  createReminderRule: ReminderRule;
  /**
   * Create a new user in the clinic
   * Requires USER_CREATE permission
   * Only CLINIC_ADMIN can create other admin users
   */
  createUser: User;
  createWebhookEndpoint: WebhookEndpoint;
  createWeeklySlot: WeeklySlot;
  deactivateAssistant: Assistant;
  deactivateReminderRule: ReminderRule;
  deactivateWebhookEndpoint: WebhookEndpoint;
  deactivateWeeklySlot: WeeklySlot;
  deleteAppointment: Appointment;
  deleteAssistant: Assistant;
  deleteAuditLog: AuditLog;
  deleteAuditLogsByEntity: Scalars['Int']['output'];
  /**
   * Delete clinic (restricted)
   * Currently disabled - contact platform support
   */
  deleteClinic: Clinic;
  deleteDoctor: Doctor;
  deletePatient: Patient;
  deleteReminderRule: ReminderRule;
  /**
   * Delete a user
   * Requires USER_DELETE permission
   * Users cannot delete themselves
   */
  deleteUser: User;
  deleteWebhookEndpoint: WebhookEndpoint;
  deleteWeeklySlot: WeeklySlot;
  generateRemindersForAppointment: Array<Reminder>;
  /**
   * Login with email and password
   * Public mutation - no authentication required
   * Returns user and list of clinics where user has account
   */
  login: LoginResponse;
  /**
   * Logout user by invalidating refresh token
   * Public mutation - can be called with or without authentication
   */
  logout: Scalars['Boolean']['output'];
  /**
   * Logout from all devices
   * Requires authentication
   * Invalidates all refresh tokens for the current user
   */
  logoutAll: Scalars['Boolean']['output'];
  markNoShow: Appointment;
  markReminderFailed: Reminder;
  markReminderSent: Reminder;
  /**
   * Refresh access token using refresh token
   * Public mutation - no authentication required
   * Returns new token pair and invalidates old refresh token
   */
  refreshToken: AuthTokens;
  /**
   * Register a new user
   * Public mutation - no authentication required
   * Password must be at least 8 characters long
   */
  register: AuthResponse;
  /**
   * Register a new company with admin user
   * Public mutation - creates clinic and clinic admin user in one step
   * No authentication required
   * Password must be at least 8 characters long
   */
  registerCompany: AuthResponse;
  resetWebhookFailureCount: WebhookEndpoint;
  /**
   * Select clinic and finalize login
   * Public mutation - no authentication required
   * Returns access token (short-lived) and refresh token (long-lived)
   */
  selectClinic: AuthResponse;
  testWebhookEndpoint: Scalars['Boolean']['output'];
  updateAppointment: Appointment;
  updateAssistant: Assistant;
  /**
   * Update clinic settings
   * Only CLINIC_ADMIN can update their own clinic
   * Requires CLINIC_UPDATE permission
   */
  updateClinic: Clinic;
  /**
   * Update clinic subscription
   * Only CLINIC_ADMIN can update subscription
   * Requires CLINIC_SETTINGS permission
   */
  updateClinicSubscription: Clinic;
  updateDoctor: Doctor;
  updatePatient: Patient;
  updateReminderRule: ReminderRule;
  /**
   * Update an existing user
   * Users can update their own data or need USER_UPDATE permission
   * Users cannot change their own active status
   */
  updateUser: User;
  updateWebhookEndpoint: WebhookEndpoint;
  updateWeeklySlot: WeeklySlot;
};


export type MutationActivateAssistantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateReminderRuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateWebhookEndpointArgs = {
  id: Scalars['ID']['input'];
};


export type MutationActivateWeeklySlotArgs = {
  id: Scalars['ID']['input'];
};


export type MutationBulkCreateWeeklySlotsArgs = {
  data: BulkCreateWeeklySlotInput;
};


export type MutationCancelAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCancelReminderArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCompleteAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationConfirmAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationCreateAppointmentArgs = {
  data: CreateAppointmentInput;
};


export type MutationCreateAssistantArgs = {
  data: CreateAssistantInput;
};


export type MutationCreateAuditLogArgs = {
  data: CreateAuditLogInput;
};


export type MutationCreateClinicArgs = {
  input: CreateClinicInput;
};


export type MutationCreateDoctorArgs = {
  data: CreateDoctorInput;
};


export type MutationCreatePatientArgs = {
  data: CreatePatientInput;
};


export type MutationCreateReminderRuleArgs = {
  data: CreateReminderRuleInput;
};


export type MutationCreateUserArgs = {
  clinicId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  passwordHash: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role: Role;
};


export type MutationCreateWebhookEndpointArgs = {
  data: CreateWebhookEndpointInput;
};


export type MutationCreateWeeklySlotArgs = {
  data: CreateWeeklySlotInput;
};


export type MutationDeactivateAssistantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateReminderRuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateWebhookEndpointArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeactivateWeeklySlotArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAssistantArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAuditLogArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteAuditLogsByEntityArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['ID']['input'];
};


export type MutationDeleteClinicArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteDoctorArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeletePatientArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteReminderRuleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWebhookEndpointArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteWeeklySlotArgs = {
  id: Scalars['ID']['input'];
};


export type MutationGenerateRemindersForAppointmentArgs = {
  appointmentId: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationLogoutArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationMarkNoShowArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMarkReminderFailedArgs = {
  error: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationMarkReminderSentArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRefreshTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRegisterCompanyArgs = {
  input: RegisterCompanyInput;
};


export type MutationResetWebhookFailureCountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSelectClinicArgs = {
  clinicId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationTestWebhookEndpointArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateAppointmentArgs = {
  data: UpdateAppointmentInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateAssistantArgs = {
  data: UpdateAssistantInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateClinicArgs = {
  input: UpdateClinicInput;
};


export type MutationUpdateClinicSubscriptionArgs = {
  input: UpdateClinicSubscriptionInput;
};


export type MutationUpdateDoctorArgs = {
  data: UpdateDoctorInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdatePatientArgs = {
  data: UpdatePatientInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateReminderRuleArgs = {
  data: UpdateReminderRuleInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateUserArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWebhookEndpointArgs = {
  data: UpdateWebhookEndpointInput;
  id: Scalars['ID']['input'];
};


export type MutationUpdateWeeklySlotArgs = {
  data: UpdateWeeklySlotInput;
  id: Scalars['ID']['input'];
};

export type Patient = {
  __typename?: 'Patient';
  address?: Maybe<Scalars['String']['output']>;
  appointments: Array<Appointment>;
  city?: Maybe<Scalars['String']['output']>;
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dob?: Maybe<Scalars['DateTime']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['ID']['output']>;
};

export type PatientSearchInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  activeReminderRules: Array<ReminderRule>;
  activeWebhookEndpoints: Array<WebhookEndpoint>;
  activeWeeklySlots: Array<WeeklySlot>;
  appointment?: Maybe<Appointment>;
  appointmentReminders: Array<Reminder>;
  appointments: Array<Appointment>;
  assistant?: Maybe<Assistant>;
  assistants: Array<Assistant>;
  auditLog?: Maybe<AuditLog>;
  auditLogs: Array<AuditLog>;
  auditLogsByActor: Array<AuditLog>;
  auditLogsByAppointment: Array<AuditLog>;
  auditLogsByEntity: Array<AuditLog>;
  auditLogsCount: Scalars['Int']['output'];
  /**
   * Get a clinic by ID
   * Users can only access their own clinic
   * Requires authentication
   */
  clinic?: Maybe<Clinic>;
  /**
   * Get clinic statistics
   * Only CLINIC_ADMIN can view
   * Requires CLINIC_READ permission
   */
  clinicStats?: Maybe<ClinicStats>;
  /**
   * Get all clinics (restricted)
   * Returns only user's clinic for now
   * Requires CLINIC_READ permission
   */
  clinics: Array<Clinic>;
  /**
   * Get the currently authenticated user
   * Requires authentication only
   */
  currentUser?: Maybe<User>;
  doctor?: Maybe<Doctor>;
  doctorAppointments: Array<Appointment>;
  doctors: Array<Doctor>;
  myAppointments: Array<Appointment>;
  myAssistantProfile?: Maybe<Assistant>;
  /**
   * Get current user's clinic with statistics
   * Requires authentication
   */
  myClinic?: Maybe<ClinicWithStats>;
  myDoctorProfile?: Maybe<Doctor>;
  myPatientProfile?: Maybe<Patient>;
  myWeeklySlots: Array<WeeklySlot>;
  patient?: Maybe<Patient>;
  patients: Array<Patient>;
  reminder?: Maybe<Reminder>;
  reminderRule?: Maybe<ReminderRule>;
  reminderRules: Array<ReminderRule>;
  reminders: Array<Reminder>;
  /**
   * Search users by name or email
   * Requires USER_READ permission
   */
  searchUsers: Array<User>;
  /**
   * Get a single user by ID
   * Requires authentication and appropriate permissions
   */
  user?: Maybe<User>;
  /**
   * Get all users in the clinic
   * Supports filtering by role, active status, and search query
   * Requires USER_READ permission
   */
  users: Array<User>;
  webhookEndpoint?: Maybe<WebhookEndpoint>;
  webhookEndpoints: Array<WebhookEndpoint>;
  weeklySlot?: Maybe<WeeklySlot>;
  weeklySlots: Array<WeeklySlot>;
};


export type QueryActiveWeeklySlotsArgs = {
  doctorId: Scalars['ID']['input'];
};


export type QueryAppointmentArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAppointmentRemindersArgs = {
  appointmentId: Scalars['ID']['input'];
};


export type QueryAppointmentsArgs = {
  filter?: InputMaybe<AppointmentFilterInput>;
};


export type QueryAssistantArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAuditLogArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAuditLogsArgs = {
  filter?: InputMaybe<AuditLogFilterInput>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAuditLogsByActorArgs = {
  actorId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryAuditLogsByAppointmentArgs = {
  appointmentId: Scalars['ID']['input'];
};


export type QueryAuditLogsByEntityArgs = {
  entity: Scalars['String']['input'];
  entityId: Scalars['ID']['input'];
};


export type QueryAuditLogsCountArgs = {
  filter?: InputMaybe<AuditLogFilterInput>;
};


export type QueryClinicArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDoctorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryDoctorAppointmentsArgs = {
  doctorId: Scalars['ID']['input'];
  filter?: InputMaybe<AppointmentFilterInput>;
};


export type QueryMyAppointmentsArgs = {
  filter?: InputMaybe<AppointmentFilterInput>;
};


export type QueryPatientArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPatientsArgs = {
  search?: InputMaybe<PatientSearchInput>;
};


export type QueryReminderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReminderRuleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRemindersArgs = {
  filter?: InputMaybe<ReminderFilterInput>;
};


export type QuerySearchUsersArgs = {
  query: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUsersArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryWebhookEndpointArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWebhookEndpointsArgs = {
  filter?: InputMaybe<WebhookEndpointFilterInput>;
};


export type QueryWeeklySlotArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWeeklySlotsArgs = {
  doctorId: Scalars['ID']['input'];
};

/** Register company input (creates clinic + user in one step) */
export type RegisterCompanyInput = {
  clinicName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
};

/** Registration input (for registering in existing clinic) */
export type RegisterInput = {
  clinicId: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  role: Role;
};

export type Reminder = {
  __typename?: 'Reminder';
  appointment: Appointment;
  appointmentId: Scalars['ID']['output'];
  channel: ReminderChannel;
  createdAt: Scalars['DateTime']['output'];
  error?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  rule?: Maybe<ReminderRule>;
  ruleId?: Maybe<Scalars['ID']['output']>;
  scheduledFor: Scalars['DateTime']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: ReminderStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReminderChannel =
  | 'EMAIL'
  | 'SMS';

export type ReminderFilterInput = {
  appointmentId?: InputMaybe<Scalars['ID']['input']>;
  channel?: InputMaybe<ReminderChannel>;
  scheduledAfter?: InputMaybe<Scalars['DateTime']['input']>;
  scheduledBefore?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<ReminderStatus>;
};

export type ReminderRule = {
  __typename?: 'ReminderRule';
  active: Scalars['Boolean']['output'];
  channel: ReminderChannel;
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  offsetMin: Scalars['Int']['output'];
  reminders: Array<Reminder>;
  template?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ReminderStatus =
  | 'FAILED'
  | 'SCHEDULED'
  | 'SENT'
  | 'SKIPPED';

export type Role =
  | 'ASSISTANT'
  | 'CLINIC_ADMIN'
  | 'DOCTOR'
  | 'PATIENT';

export type UpdateAppointmentInput = {
  end?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['DateTime']['input']>;
  status?: InputMaybe<AppointmentStatus>;
};

export type UpdateAssistantInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating clinic settings */
export type UpdateClinicInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  legalName?: InputMaybe<Scalars['String']['input']>;
  logoUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating clinic subscription */
export type UpdateClinicSubscriptionInput = {
  id: Scalars['ID']['input'];
  plan: Scalars['String']['input'];
  status: Scalars['String']['input'];
  until?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateDoctorInput = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  gcalCalendarId?: InputMaybe<Scalars['String']['input']>;
  isAcceptingNewPatients?: InputMaybe<Scalars['Boolean']['input']>;
  languages?: InputMaybe<Array<Scalars['String']['input']>>;
  specialty?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePatientInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  dob?: InputMaybe<Scalars['DateTime']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateReminderRuleInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  channel?: InputMaybe<ReminderChannel>;
  offsetMin?: InputMaybe<Scalars['Int']['input']>;
  template?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWebhookEndpointInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  events?: InputMaybe<Array<Scalars['String']['input']>>;
  secret?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWeeklySlotInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  durationMin?: InputMaybe<Scalars['Int']['input']>;
  endTime?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['String']['input']>;
  weekday?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  active: Scalars['Boolean']['output'];
  assistant?: Maybe<Assistant>;
  clinic?: Maybe<Clinic>;
  clinicId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  doctor?: Maybe<Doctor>;
  email: Scalars['String']['output'];
  emailVerified: Scalars['Boolean']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastLoginAt?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  patient?: Maybe<Patient>;
  phone?: Maybe<Scalars['String']['output']>;
  role: Role;
  updatedAt: Scalars['String']['output'];
};

export type WebhookEndpoint = {
  __typename?: 'WebhookEndpoint';
  active: Scalars['Boolean']['output'];
  clinic: Clinic;
  clinicId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  events: Array<Scalars['String']['output']>;
  failureCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  lastFailureAt?: Maybe<Scalars['DateTime']['output']>;
  lastSuccessAt?: Maybe<Scalars['DateTime']['output']>;
  secret: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
};

export type WebhookEndpointFilterInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  event?: InputMaybe<Scalars['String']['input']>;
};

export type WeeklySlot = {
  __typename?: 'WeeklySlot';
  active: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  doctor: Doctor;
  doctorId: Scalars['ID']['output'];
  durationMin?: Maybe<Scalars['Int']['output']>;
  endTime: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weekday: Scalars['Int']['output'];
};

export type WeeklySlotDataInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  durationMin?: InputMaybe<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  startTime: Scalars['String']['input'];
  weekday: Scalars['Int']['input'];
};
