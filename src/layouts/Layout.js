import React, { Suspense } from 'react';
import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { LinearProgress, Typography } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import BetaFlag from '../components/BetaFlag';
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
  pageContainer: {
    margin: theme.spacing(10, 2, 2, 2),
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(10),
    },
    position: 'relative',
    padding: theme.spacing(2),
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
    <div className={classes.root}>
      <div className={classes.container}>
        <main className={classes.content}>
          <BetaFlag />
          <WalletProfile />
          <Container maxWidth="md">
            <Paper elevation={0}>
              <Suspense fallback={<LinearProgress />}>
                <Page className={classes.pageContainer} title="dao.care">
                  {renderRoutes(route.routes)}
                  <Typography
                    variant="caption"
                    color="secondary"
                    style={{ textAlign: 'center' }}
                  >
                    We are currently running on Kovan network. Please get DAI
                    from Aave{' '}
                    <a
                      href="https://testnet.aave.com/faucet/DAI"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      test app
                    </a>
                    .
                  </Typography>
                </Page>
              </Suspense>
            </Paper>
          </Container>
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  route: PropTypes.object,
};

export default Layout;
