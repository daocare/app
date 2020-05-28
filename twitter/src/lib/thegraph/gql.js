// Remove the apollo-boost import and change to this:
// TODO: we are using both `node-fetch` and isomorphic fetch. Should only use 1...
const fetch = require('node-fetch');
const ApolloClient = require('apollo-client').default;
// Setup the network "links"
const { WebSocketLink } = require('apollo-link-ws');
const { HttpLink } = require('apollo-link-http');
const ws = require('ws');
const { split } = require('apollo-link');
const { getMainDefinition } = require('apollo-utilities');
const { InMemoryCache } = require('apollo-cache-inmemory');
const dotenv = require('dotenv');

dotenv.config();

const connection_string =
  'api.thegraph.com/subgraphs/name/daocare/daocare_graph';
// const connection_string = process.env.GRAPH_CONNECTION_STRING;
console.log('The connection_string', connection_string);
const httpLink = new HttpLink({
  uri: 'https://' + connection_string, // use https for secure endpoint
  fetch: fetch,
});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: 'wss://' + connection_string, // use wss for a secure endpoint
  options: {
    reconnect: true,
  },
  webSocketImpl: ws,
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

// Instantiate client
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

module.exports = {
  subscribe: (query, variables, callback) =>
    client.subscribe({ query, variables }).subscribe({
      next: ({ data }) => {
        callback(data);
      },
      error: (e) => console.error(e),
    }),
};
