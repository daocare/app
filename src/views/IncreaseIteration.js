import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Update';
import { useForm } from 'react-hook-form';
import { Page } from '../components';
import Header from '../components/Header';
import useRouter from '../utils/useRouter';
import useWeb3Connect from '../utils/useWeb3Connect';
import LoadingWeb3 from '../components/LoadingWeb3';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';
const BN = require('bn.js');

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  decriptionBlurb: { margin: '16px 0' },
  flexGrow: {
    flexGrow: 1,
  },
  button: {
    width: 190,
  },
}));

const IncreaseIteration = () => {
  const classes = useStyles();
  const web3Connect = useWeb3Connect();

  useRedirectHomeIfNoEthAccount();

  const numSecondsLeftInIteration = Math.max(
    0,
    web3Connect.currentIterationDeadline -
      Math.floor(new Date().getTime() / 1000)
  );
  const topProject = web3Connect.topProposalInCurrentIterationId;

  return (
    <Page className={classes.root} title="dao.care | Deposit">
      {web3Connect.loadingWeb3 || web3Connect.fetched ? (
        <>
          <LoadingWeb3 />
        </>
      ) : (
        <>
          <Header />
          <Typography variant="body1" className={classes.decriptionBlurb}>
            This is an admin function to increase the iteration. This isn't
            styled to look good, only for admin purposes now.
          </Typography>

          <Typography variant="body1">
            Current iteration Number: {web3Connect.currentIteration}
          </Typography>
          <Typography variant="body1">
            Number of seconds till next iteration (only calculated when
            component reloads - no `useEffect`s yet ;) ):{' '}
            {numSecondsLeftInIteration}
          </Typography>
          <Typography variant="body1">
            current top project id in current voting round (0 mean no project is
            winning at the moment): {topProject}{' '}
            {topProject > 0
              ? '(' + web3Connect.proposals[topProject - 1].title + ')'
              : ''}
          </Typography>

          <div
            className={classes.divContainer}
            style={{
              marginTop: 24,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            <Button
              color="primary"
              size="large"
              className={classes.button}
              startIcon={<UpdateIcon />}
              onClick={web3Connect.contracts.dao.methods.distributeFunds}
            >
              Increment Iteration
            </Button>
          </div>
        </>
      )}
    </Page>
  );
};

IncreaseIteration.propTypes = {
  className: PropTypes.string,
};

export default IncreaseIteration;
