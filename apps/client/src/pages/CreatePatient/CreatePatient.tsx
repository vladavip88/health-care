import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextInput,
  Button,
  Container,
  Title,
  Group,
  Text,
  SimpleGrid,
  Paper,
  Select,
  Textarea,
  Anchor,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useCreatePatient } from '../../apollo/hooks/useCreatePatient';
import type { CreatePatientMutationVariables } from '../../generated/graphql';


type CreatePatientFormData = CreatePatientMutationVariables['data'];

const createPatientSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Email must be valid').optional(),
  phone: yup.string().optional(),
  dob: yup.date().optional().nullable(),
  gender: yup.string().optional(),
  address: yup.string().optional(),
  city: yup.string().optional(),
  country: yup.string().optional(),
  notes: yup.string().optional(),
});

export function CreatePatient() {
  const navigate = useNavigate();
  const { createPatient, loading } = useCreatePatient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreatePatientFormData>({
    resolver: yupResolver(createPatientSchema as yup.ObjectSchema<CreatePatientFormData>),
  });

  const onSubmit = async (data: CreatePatientFormData) => {
    try {
      // DatePickerInput already returns a Date object, so no conversion needed
      await createPatient(data);
      // After successful patient creation, redirect to patients list
      navigate('/patients');
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error(error);
    }
  };

  return (
    <Container size="lg">
      <Paper p="lg" radius="md" withBorder shadow="sm">
        <Title order={1} >
          Create New Patient
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Add a new patient to your clinic
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Personal Information Section */}
          <SimpleGrid cols={2} spacing="md" mb="md">
            <TextInput
              label={
                <span>
                  First Name <span style={{ color: '#ff6b6b' }}>*</span>
                </span>
              }
              placeholder="First name"
              {...register('firstName')}
              error={errors.firstName?.message}
              disabled={loading}
            />
            <TextInput
              label={
                <span>
                  Last Name <span style={{ color: '#ff6b6b' }}>*</span>
                </span>
              }
              placeholder="Last name"
              {...register('lastName')}
              error={errors.lastName?.message}
              disabled={loading}
            />
          </SimpleGrid>

          {/* Contact Information Section */}
          <TextInput
            label="Email Address"
            placeholder="your@email.com"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={loading}
            mb="md"
          />

          <TextInput
            label="Phone Number"
            placeholder="Phone number"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={loading}
            mb="md"
          />

          {/* Personal Details Section */}
          <Controller
            name="dob"
            control={control}
            render={({ field }) => (
              <DatePickerInput
                label="Date of Birth"
                placeholder="Pick date"
                {...field}
                value={field.value ? new Date(field.value as unknown as string) : null}
                onChange={(date) => field.onChange(date)}
                error={errors.dob?.message ? String(errors.dob.message) : undefined}
                disabled={loading}
                mb="md"
              />
            )}
          />

          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                label="Gender"
                placeholder="Select gender"
                data={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                {...field}
                error={errors.gender?.message ? String(errors.gender.message) : undefined}
                disabled={loading}
                mb="md"
                clearable
              />
            )}
          />

          {/* Address Section */}
          <TextInput
            label="Address"
            placeholder="Street address"
            {...register('address')}
            error={errors.address?.message}
            disabled={loading}
            mb="md"
          />

          <SimpleGrid cols={2} spacing="md" mb="md">
            <TextInput
              label="City"
              placeholder="City"
              {...register('city')}
              error={errors.city?.message}
              disabled={loading}
            />
            <TextInput
              label="Country"
              placeholder="Country"
              {...register('country')}
              error={errors.country?.message}
              disabled={loading}
            />
          </SimpleGrid>

          {/* Notes Section */}
          <Textarea
            label="Notes"
            placeholder="Additional notes about the patient"
            {...register('notes')}
            error={errors.notes?.message}
            disabled={loading}
            mb="lg"
            minRows={3}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Patient...' : 'Create Patient'}
          </Button>
        </form>

        <Group justify="center" mt="md">
          <Text size="sm">
            <Anchor component={Link} to="/patients">
              Back to Patients
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}

export default CreatePatient;
