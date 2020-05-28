import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/styles';

import { Typography, Button, Grid } from '@material-ui/core';

import useWeb3Modal from '../utils/useWeb3Modal';
import useUserData from '../utils/useUserData';
import useProposals from '../utils/useProposals';
import useDepositContract from '../utils/useDepositContract';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';
import LoadingWeb3 from '../components/LoadingWeb3';

const useStyles = makeStyles((theme) => ({}));

const Experiment = () => {
  const userData = useUserData();
  const proposalsData = useProposals();
  const depositContract = useDepositContract();

  //   const test = userData.getUser('0x5790c9593e0d4a17a446d4c4b1c30b0541cdd10b');
  // const test = userData.getUser('0x3281434f39b97e040a469891cb3b278283cb32cc');

  useEffect(() => {
    console.log('fetchProposals effect');
    proposalsData.fetchProposals();
  }, []);

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
        Experiment page
      </Typography>
    </Page>
  );
};

export default Experiment;
