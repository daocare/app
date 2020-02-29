import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';

import { Page } from '../../components';
// import {
//   Intro,
//   Newsletter,
//   PadeleeRegistration,
//   // Team,
//   Partners,
//   Footer,
// } from './components';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';

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
  // const classes = useStyles();

  return (
    <Page className={classes.root} title="ETHLondon DAO">
      <Container maxWidth="md">
        <p>OLA</p>
        <Button variant="contained" color="primary" disableElevation>
          Web3
        </Button>
      </Container>
    </Page>
  );
};

export default Home;
