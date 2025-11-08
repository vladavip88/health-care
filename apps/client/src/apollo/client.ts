import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/graphql';

const httpLink = new HttpLink({
  uri: apiUrl,
  credentials: 'include', // Send cookies with requests for authentication
  fetchOptions: {
    method: 'POST',
  },
});

// Add authorization header to each request
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accessToken');

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }));

  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
