import ApolloClient from 'apollo-boost';

export const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/daocare/daocare_graph',
});
