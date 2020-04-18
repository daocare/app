import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button, Grid } from '@material-ui/core';
import useWeb3Connect from '../utils/useWeb3Connect';
import useRouter from '../utils/useRouter';
import useInterval from '../utils/useInterval';

import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DepositIcon from '@material-ui/icons/AllInclusive';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';
import FooterInfo from '../components/FooterInfo';

const useStyles = makeStyles((theme) => ({
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
    fontSize: 28,
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
}));

const Home = () => {
  const classes = useStyles();
  const web3Connect = useWeb3Connect();

  const connected = useSelector((state) => state.user.connected);

  const router = useRouter();
  const [interest, setInterest] = useState(0);
  const [totalFundAmount, setTotalFundAmount] = useState(0);

  let hasFundsDeposited = web3Connect.daiDeposit > 0;

  useInterval(async () => {
    if (web3Connect) {
      let interest = await web3Connect.contracts.dao.methods.getInterest();
      setInterest(interest);
      let totalFundAmount = await web3Connect.contracts.dao.methods.getTotalDepositedAmount();
      setTotalFundAmount(totalFundAmount);
    }
  }, 2000);

  return (
    <Page title="dao.care">
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        Deposit your DAI. Let your idle interest support community projects.
        Vote DAO style on twitter for your favourite project every 2 weeks.
        Interest from the pool is sent to the chosen community project for 2
        weeks if selected by the DAO. Withdraw your original DAI at anytime.
      </Typography>

      <Grid container justify="space-between" spacing={2}>
        <Grid item xs={12} md={4} className={classes.gridItem}>
          <Typography variant="body1" className={classes.numberHighlight}>
            {totalFundAmount > 0 ? (
              <>
                {totalFundAmount}
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
            {interest > 0 ? (
              <>
                {interest.toFixed(5)}
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
        </Grid>
        <Grid item xs={12} md={4} className={classes.gridItem}>
          <Typography variant="body1" className={classes.numberHighlight}>
            {interest > 0 ? (
              <>
                {interest.toFixed(5)}
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
        </Grid>
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
                await web3Connect.triggerConnect();
                router.history.push('/submit-proposal');
              };
              connect();
            }
          }}
        >
          Submit Proposal
        </Button>
        {!hasFundsDeposited ? (
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
                  await web3Connect.triggerConnect();
                  router.history.push('/deposit');
                };
                connect();
              }
            }}
          >
            Join Pool
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            size="large"
            className={classes.button}
            startIcon={<WithdrawIcon />}
            onClick={() => {
              if (connected) {
                router.history.push('/withdraw');
              } else {
                const connect = async () => {
                  await web3Connect.triggerConnect();
                  router.history.push('/withdraw');
                };
                connect();
              }
            }}
          >
            Withdraw Funds
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
          All Proposals
        </Button>
      </div>
      <FooterInfo />
    </Page>
  );
};

export default Home;
