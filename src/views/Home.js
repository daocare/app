import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button } from '@material-ui/core';
import useWeb3Connect from '../utils/useWeb3Connect';
import useRouter from '../utils/useRouter';
import useInterval from '../utils/useInterval';

import HowToVoteIcon from '@material-ui/icons/HowToVote';
import DepositIcon from '@material-ui/icons/AllInclusive';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';

const useStyles = makeStyles((theme) => ({
  button: {
    margin: '20px 32px 20px 32px',
    width: 220,
  },
  decriptionBlurb: { margin: '16px 0' },
  interestBlurb: {
    fontSize: 24,
  },
  interestCountUp: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A362A5',
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
  let connected = web3Connect.connected;
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
    <>
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        Deposit your DAI. Let your idle interest support community projects.
        Vote DAO style on twitter for your favourite project every 2 weeks.
        Interest from the pool is sent to the chosen community project for 2
        weeks if selected by the DAO. Withdraw your original DAI at anytime.
      </Typography>
      <Typography variant="body1" className={classes.interestBlurb}>
        The dao.care fund is currently{' '}
        {totalFundAmount === 0 ? (
          <span>{<EllipsisLoader />}</span>
        ) : (
          <span className={classes.interestCountUp}>
            {' '}
            {totalFundAmount} DAI!
          </span>
        )}
        <br />
        The previous winning project has earned{' '}
        {interest > 0 && (
          <span className={classes.interestCountUp}>${interest} DAI!</span>
        )}
        {interest === 0 && <span>{<EllipsisLoader />}</span>} so far this
        period.
        <br />
        At this rate the project will earn <strong>...TODO...</strong> DAI by
        the end of the period.
      </Typography>

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
      </div>
      <div className={classes.buttonContainer}>
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
    </>
  );
};

export default Home;
