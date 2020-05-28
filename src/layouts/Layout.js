import React from 'react';

import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/styles';

import Container from '@material-ui/core/Container';
import PageContainer from './PageContainer';

import BetaFlag from '../components/BetaFlag';
import WalletProfile from '../components/WalletProfile';
import Nav from '../components/Nav';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
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
    height: '100vh',
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
    <div className={classes.root}>
      <div className={classes.container}>
        <main className={classes.content}>
          <BetaFlag />
          <Container maxWidth="md">
            <WalletProfile />
            <PageContainer route={route} />
            <Nav />
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
