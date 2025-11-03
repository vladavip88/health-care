import { prisma } from '../../lib/prisma';
import { createClinicRepository } from './clinic.repository';
import { createClinicService } from './clinic.service';
import { createClinicQueries } from './clinic.queries';
import { createClinicMutations } from './clinic.mutations';

// Initialize the layers
const clinicRepository = createClinicRepository(prisma);
const clinicService = createClinicService(clinicRepository);
const clinicQueries = createClinicQueries(clinicService);
const clinicMutations = createClinicMutations(clinicService);

/**
 * Clinic Resolver
 * Combines queries and mutations into a single resolver object
 */
export const clinicResolver = {
  Query: {
    ...clinicQueries,
  },
  Mutation: {
    ...clinicMutations,
  },
};
