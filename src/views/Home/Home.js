import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useWeb3Connect from '../../utils/useWeb3Connect';
import { Page, WalletProfile } from '../../components';
// import {
//   Intro,
//   Newsletter,
//   PadeleeRegistration,
//   // Team,
//   Partners,
//   Footer,
// } from './components';
import Container from '@material-ui/core/Container';

import { Typography } from '@material-ui/core';
const useStyles = makeStyles(theme => ({
  root: {
    // backgroundColor: '#fafafa',
    // backgroundImage: 'url("/images/undraw_deliveries_131a.svg")',
    backgroundRepeat: 'no-repeat',
    [theme.breakpoints.up('sm')]: {
      backgroundSize: '39%',
    },
    backgroundSize: '45%',
    backgroundPosition: '98% 5px',
    position: 'relative',
    margin: theme.spacing(8),
  },
}));

const Home = () => {
  const classes = useStyles();

  return (
    <Page className={classes.root} title="ETHLondon DAO">
      <Container maxWidth="md">
        <WalletProfile />
        <p>OLA</p>
      </Container>
    </Page>
  );
};

export default Home;
