import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import { TextInput, Button, Container, Title, Group, Text, PasswordInput, Paper } from '@mantine/core';
import { useLogin } from '../../apollo/hooks/useLogin';


interface LoginFormData {
  email: string;
  password: string;
}

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email must be valid')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export function Login() {
  const navigate = useNavigate();
  const { login, loading } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data);
      if (response?.clinics && response.clinics.length > 0) {
        // Redirect to clinic selection page with login credentials and available clinics
        navigate('/clinic-selection', {
          state: {
            loginData: data,
            clinics: response.clinics
          },
          replace: true
        });
      }
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      console.error(error);
    }
  };

  return (
    <Container size="sm" >
      <Paper p="lg" radius="md" withBorder shadow="sm">
        <Title order={3} mb="md" ta="center">
          Login
        </Title>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            type="email"
            {...register('email')}
            error={errors.email?.message}
            disabled={loading}
            mb="md"
          />

          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            {...register('password')}
            error={errors.password?.message}
            disabled={loading}
            mb="lg"
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Group justify="center" mt="md">
          <Text size="sm">
            Don't have an account?{' '}
            <Link to="/register">
              Register here
            </Link>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}

export default Login;
