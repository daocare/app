import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPH_ENDPOINT,
});

export const aaveClient = new ApolloClient({
  uri: process.env.REACT_APP_AAVE_GRAPH_ENDPOINT,
});
