import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import { Typography, Button, Grid } from '@material-ui/core';

import useWeb3Modal from '../utils/useWeb3Modal';
import useUserData from '../utils/useUserData';
import useProposals from '../utils/useProposals';
import useDepositContract from '../utils/useDepositContract';
import useIteration from '../utils/useIteration';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';
import LoadingWeb3 from '../components/LoadingWeb3';

const useStyles = makeStyles((theme) => ({}));

const Experiment = () => {
  useEffect(() => {}, []);

  const test = () => {
    console.log('test');
  };

  const classes = useStyles();

  const connected = useSelector((state) => state.user.connected);
  const { interestPrev, interestNext, fundSize } = useSelector(
    (state) => state.fund
  );
  const userDaiDeposit = useSelector((state) => state.user.daiDeposit);

  //TODO - make user dai deposit have value, swithc to usestate
  let hasFundsDeposited = userDaiDeposit > 0;

  return (
    <Page title="dao.care">
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        <button onClick={() => test()}> Tesy</button>
      </Typography>
    </Page>
  );
};

export default Experiment;
