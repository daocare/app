import React from 'react';
import PropTypes from 'prop-types';

import { ApolloProvider } from '@apollo/react-hooks';
import { client, aaveClient } from '../utils/Apollo';
import store from '../redux/store';
import ReduxWrapper from './ReduxWrapper';

const ApolloWrapper = (props) => {
  const { route } = props;

  return (
    <ApolloProvider client={client}>
      <ApolloProvider client={aaveClient}>
        <ReduxWrapper route={route} />
      </ApolloProvider>
    </ApolloProvider>
  );
};

ApolloWrapper.propTypes = {
  route: PropTypes.object,
};

export default ApolloWrapper;
