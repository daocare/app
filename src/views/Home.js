import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';
import Moment from 'moment';

import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button, Grid } from '@material-ui/core';

import useWeb3Modal from '../utils/useWeb3Modal';
import useUserData from '../utils/useUserData';
import useRouter from '../utils/useRouter';

import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DepositIcon from '@material-ui/icons/AllInclusive';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';
import FooterInfo from '../components/FooterInfo';
import Countdown from '../components/Countdown';

const useStyles = makeStyles((theme) => ({
  homeContainer: {
    display: 'flex',
    flexFlow: 'column nowrap',
    justifyContent: 'space-between',
    height: '100%',
  },
  button: {
    margin: '20px 32px 20px 32px',
    width: 220,
  },
  decriptionBlurb: { margin: '16px 0' },
  gridItem: {
    textAlign: 'center',
  },
  interestBlurb: {
    fontSize: 24,
  },
  numberHighlight: {
    fontSize: 80,
    display: 'inline',
    fontWeight: 'bold',
    color: '#A362A5',
  },
  currencyHighlight: {
    display: 'inline',
    color: '#aaa',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  countdown: {
    color: '#6850A8',
  },
}));

const Home = () => {
  const userData = useUserData();
  const web3Modal = useWeb3Modal();

  const classes = useStyles();

  const connected = useSelector((state) => state.user.connected);
  const { interestPrev, interestNext } = useSelector((state) => state.fund);
  let fundSize = useSelector((state) => state.fund.fundSize);
  const proposals = useSelector((state) => state.proposals.proposals);
  const numberOfMembers = useSelector((state) => state.fund.numberOfMembers);
  const userDaiDeposit = useSelector((state) => state.user.daiDeposit);
  const { currentIterationDeadline, currentIteration } = useSelector(
    (state) => state.iteration
  );

  const router = useRouter();

  return (
    <Page title="dao.care">
      {/* <button onClick={() => console.log(userDaiDeposit)}>test</button> */}
      <Header />
      <div className={classes.homeContainer}>
        <Typography variant="body1" className={classes.decriptionBlurb}>
          <span style={{ display: 'block', paddingBottom: '10px' }}>
            Deposit your DAI. Let your idle interest support community projects.
            Vote DAO style on twitter for your favourite project every 2 weeks.
            Interest from the pool is sent to the chosen community project for 2
            weeks if selected by the DAO. Withdraw your original DAI at anytime.
          </span>
          <span style={{ display: 'block', paddingTop: '10px' }}>
            The {currentIteration == 0 ? 'first' : 'next'} iteration will begin
            in{' '}
            <span className={classes.countdown}>
              <Countdown />
            </span>
          </span>
        </Typography>

        <Grid container justify="space-between" spacing={2}>
          <Grid item xs={12} md={4} className={classes.gridItem}>
            <Typography variant="body1" className={classes.numberHighlight}>
              {fundSize ? (
                <>
                  {fundSize}
                  <Typography
                    variant="body1"
                    className={classes.currencyHighlight}
                  >
                    {' '}
                    DAI
                  </Typography>
                </>
              ) : (
                <EllipsisLoader />
              )}
            </Typography>
            <Typography variant="body1">Fund size</Typography>
          </Grid>
          <Grid item xs={12} md={4} className={classes.gridItem}>
            <Typography variant="body1" className={classes.numberHighlight}>
              {numberOfMembers > 0 ? (
                <span>{numberOfMembers} </span>
              ) : (
                <EllipsisLoader />
              )}
            </Typography>
            <Typography variant="body1">Number of Members</Typography>
          </Grid>
          <Grid item xs={12} md={4} className={classes.gridItem}>
            {proposals != null ? (
              <Typography variant="body1" className={classes.numberHighlight}>
                {proposals.length}
              </Typography>
            ) : (
              <EllipsisLoader />
            )}
            <Typography variant="body1">Number of Proposals</Typography>
          </Grid>
          {/* 
            READY to be uncommented
          <Grid item xs={12} md={4} className={classes.gridItem}>
            <Typography variant="body1" className={classes.numberHighlight}>
              {interestPrev ? (
                <>
                  {interestPrev.toFixed(1)}
                  <Typography
                    variant="body1"
                    className={classes.currencyHighlight}
                  >
                    {' '}
                    DAI
                  </Typography>
                </>
              ) : (
                <EllipsisLoader />
              )}
            </Typography>
            <Typography variant="body1">
              Previous winner <br /> interest rewarded
            </Typography>
          </Grid> */}
          {/* <Grid item xs={12} md={4} className={classes.gridItem}>
          <Typography variant="body1" className={classes.numberHighlight}>
            {interestNext > 0 ? (
              <>
                {interestNext.toFixed(5)}
                <Typography
                  variant="body1"
                  className={classes.currencyHighlight}
                >
                  {' '}
                  DAI
                </Typography>
              </>
            ) : (
              <EllipsisLoader />
            )}
          </Typography>
          <Typography variant="body1">
            Next winner <br /> interest reward
          </Typography>
        </Grid> */}
        </Grid>
        <div className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            className={classes.button}
            startIcon={<AddIcon />}
            onClick={() => {
              if (connected) {
                router.history.push('/submit-proposal');
              } else {
                const connect = async () => {
                  try {
                    await web3Modal.triggerConnect();
                    router.history.push('/submit-proposal');
                  } catch {
                    console.warn('Cancelled connection');
                  }
                };
                connect();
              }
            }}
          >
            Submit Proposal
          </Button>
          {userDaiDeposit > 0 ? (
            <span />
          ) : (
            // <Button
            //   variant="contained"
            //   color="secondary"
            //   size="large"
            //   className={classes.button}
            //   startIcon={<WithdrawIcon />}
            //   onClick={() => {
            //     if (connected) {
            //       router.history.push('/withdraw');
            //     } else {
            //       const connect = async () => {
            //         try {
            //           await useWeb3Modal.triggerConnect();
            //           router.history.push('/withdraw');
            //         } catch {
            //           console.warn('Cancelled connection');
            //         }
            //       };
            //       connect();
            //     }
            //   }}
            // >
            //   Withdraw Funds
            // </Button>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              className={classes.button}
              startIcon={<DepositIcon />}
              onClick={() => {
                if (connected) {
                  router.history.push('/deposit');
                } else {
                  const connect = async () => {
                    try {
                      await web3Modal.triggerConnect();
                      router.history.push('/deposit');
                    } catch {
                      console.warn('Cancelled connection');
                    }
                  };
                  connect();
                }
              }}
            >
              Join Pool
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            size="large"
            className={classes.button}
            startIcon={<HowToVoteIcon />}
            onClick={() => {
              router.history.push('/proposals');
            }}
          >
            View Proposals
          </Button>
        </div>
      </div>
      {/* <FooterInfo /> */}
    </Page>
  );
};

export default Home;
