import React, { Suspense } from 'react';

import { Provider } from 'react-redux';
import store from '../redux/store';

import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import BetaFlag from '../components/BetaFlag';
import FooterInfo from '../components/FooterInfo';
import Page from '../components/Page';
import WalletProfile from '../components/WalletProfile';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  pageOuterContainer: {
    padding: theme.spacing(2),
    position: 'relative',
    height: '80vh',
  },
  pageInnerContainer: {
    margin: theme.spacing(0, 2),
    overflow: 'auto',
    height: '99%',
  },
  container: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    overflowY: 'auto',
    flex: '1 1 auto',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    background:
      '-webkit-radial-gradient(#B1A4D4 5%, #9E8DC9 30%, #6850A8 60%);' /* Chrome 10-25, Safari 5.1-6 */,
    // eslint-disable-next-line
    background:
      'radial-gradient(#B1A4D4 10%, #9E8DC9 30%, #6850A8 90%);' /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,
  },
}));

const Layout = (props) => {
  const { route } = props;

  const classes = useStyles();

  return (
    <Provider store={store}>
      <div className={classes.root}>
        <div className={classes.container}>
          <main className={classes.content}>
            <BetaFlag />
            <Container maxWidth="md">
              <WalletProfile />
              <Paper elevation={0} className={classes.pageOuterContainer}>
                <Page title="dao.care" className={classes.pageInnerContainer}>
                  <Suspense fallback={<LinearProgress />}>
                    {renderRoutes(route.routes)}
                  </Suspense>
                </Page>
                <FooterInfo />
              </Paper>
            </Container>
          </main>
        </div>
      </div>
    </Provider>
  );
};

Layout.propTypes = {
  route: PropTypes.object,
};

export default Layout;
