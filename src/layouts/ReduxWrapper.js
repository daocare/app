import React from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import store from '../redux/store';
import Layout from './Layout';

const ReduxWrapper = (props) => {
  const { route } = props;

  return (
    <Provider store={store}>
      <Layout route={route} />
    </Provider>
  );
};

ReduxWrapper.propTypes = {
  route: PropTypes.object,
};

export default ReduxWrapper;
