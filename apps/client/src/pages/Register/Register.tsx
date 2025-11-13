import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, Button, Container, Title, Group, Text, PasswordInput, SimpleGrid, Paper } from '@mantine/core';
import { useRegister } from '../../apollo/hooks/useRegister';
import type { RegisterCompanyMutationVariables } from '../../generated/graphql';
import styles from './Register.module.scss';

type RegisterFormData = RegisterCompanyMutationVariables['input'] & { clinicName: string };

const registerSchema = yup.object().shape({
  clinicName: yup
    .string()
    .required('Clinic name is required'),
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  email: yup
    .string()
    .email('Email must be valid')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  phone: yup
    .string()
    .required('Phone number is required'),
});

export function Register() {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema as yup.ObjectSchema<RegisterFormData>),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      // After successful registration with clinic creation, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error(error);
    }
  };

  return (
    <Container size="sm" className={styles.container}>
      <Paper p="lg" radius="md" withBorder shadow="sm">
        <Title order={1} className={styles.title}>
          Create Clinic Owner Account
        </Title>
        <Text size="sm" c="dimmed" mb="lg">
          Set up your clinic admin account to get started
        </Text>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Clinic Information Section */}
          <TextInput
            label={
              <span>
                Clinic Name <span style={{ color: '#ff6b6b' }}>*</span>
              </span>
            }
            placeholder="e.g., Central Healthcare Clinic"
            {...register('clinicName')}
            error={errors.clinicName?.message}
            disabled={loading}
            mb="md"
          />

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

          {/* Email Section */}
          <TextInput
            label={
              <span>
                Email Address <span style={{ color: '#ff6b6b' }}>*</span>
              </span>
            }
            placeholder="your@email.com"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={loading}
            mb="md"
          />

          {/* Password Section */}
          <PasswordInput
            label={
              <span>
                Password <span style={{ color: '#ff6b6b' }}>*</span>
              </span>
            }
            placeholder="Minimum 8 characters"
            {...register('password')}
            error={errors.password?.message}
            disabled={loading}
            mb="md"
          />

          {/* Phone Section */}
          <TextInput
            label={
              <span>
                Phone Number <span style={{ color: '#ff6b6b' }}>*</span>
              </span>
            }
            placeholder="Phone number"
            type="tel"
            {...register('phone')}
            error={errors.phone?.message}
            disabled={loading}
            mb="lg"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <Group justify="center" mt="md">
          <Text size="sm">
            Already have an account?{' '}
            <Link to="/login" className={styles.link}>
              Login here
            </Link>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}

export default Register;
