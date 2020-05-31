import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Moment from 'moment';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import UpdateIcon from '@material-ui/icons/Update';

import Page from '../components/Page';
import Header from '../components/Header';
import useRouter from '../utils/useRouter';
import useDaoContract from '../utils/useDaoContract';
import useIteration from '../utils/useIteration';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';
const BN = require('bn.js');

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  decriptionBlurb: { margin: '16px 0' },
  button: {
    width: 190,
  },
}));

const IncreaseIteration = () => {
  const classes = useStyles();
  const daoContract = useDaoContract();
  const iteration = useIteration();

  const { currentIteration, currentIterationDeadline } = useSelector(
    (state) => state.iteration
  );

  const proposals = useSelector((state) => state.proposals.proposals);

  const numSecondsLeftInIteration = Math.max(
    0,
    currentIterationDeadline - Math.floor(new Date().getTime() / 1000)
  ); // unused but can be used to implement countdown

  useRedirectHomeIfNoEthAccount();

  useEffect(() => {
    iteration.getIteration();
    iteration.getCurrentIterationIncreaseTimestamp();
  }, []);

  //TODO: bring back
  // const topProject = web3Connect.topProposalInCurrentIterationId;

  return (
    <Page className={classes.root} title="dao.care | Increase Iteration">
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        You! 👉🏽 Yes you! 👆🏽👉🏽👆🏽👉🏽 <br />
        How did you get here? <br />
        This is an admin function to increase the iteration. It's open to anyone
        to take the action and the first to do it is rewarded 🤠. A secret game
        within the DAO. Ping the dev team on{' '}
        <a href="https://t.me/daocare" target="_blank">
          telegram
        </a>{' '}
        if you find this nugget and we will give you some more info.
      </Typography>

      <Typography variant="body1">
        Current iteration Number: {currentIteration}
      </Typography>
      <Typography variant="body1">
        Time until next iteration :{' '}
        {Moment.unix(currentIterationDeadline).fromNow()}
      </Typography>
      <Typography variant="body2">(refresh the page to update)</Typography>
      {/*      <Typography variant="body1">
        Current top project id in current voting round (0 mean no project is
        winning at the moment): {topProject}{' '}
 {topProject > 0 ? '(' + proposals[topProject - 1].title + ')' : ''} 
      </Typography>*/}

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
          onClick={() => daoContract.distributeFunds()}
        >
          Increment Iteration
        </Button>
      </div>
    </Page>
  );
};

IncreaseIteration.propTypes = {
  className: PropTypes.string,
};

export default IncreaseIteration;
