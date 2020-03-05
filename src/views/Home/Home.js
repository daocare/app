import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useWeb3Connect from '../../utils/useWeb3Connect';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button } from '@material-ui/core';
import useRouter from '../../utils/useRouter';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import useInterval from '../../utils/useInterval';

import DonateIcon from '@material-ui/icons/AllInclusive';
import Header from '../../components/Header';

const useStyles = makeStyles(theme => ({
  button: {
    margin: 32,
    width: 220,
  },
  // divContainer: {
  //   [theme.breakpoints.up('sm')]: {
  //     backgroundSize: '39%',
  //   },
  // }
}));

const Home = () => {
  const classes = useStyles();
  const web3Connect = useWeb3Connect();
  let connected = web3Connect.connected;
  const router = useRouter();
  const [interest, setInterest] = useState(0);

  useInterval(async () => {
    if (web3Connect) {
      let interest = await web3Connect.contracts.dao.methods.getInterest();
      console.log({ interest });
      setInterest(interest);
    }
  }, 2000);

  return (
    <>
      <Header />
      <Typography variant="body1" style={{ fontSize: 24 }}>
        Every two weeks, the preferred project of the community will receive{' '}
        {interest > 0 && (
          <span style={{ fontSize: 28, fontWeight: 'bold', color: '#A362A5' }}>
            ${interest}!
          </span>
        )}
        {interest === 0 && <span>...</span>}
      </Typography>
      {/* {!connected && ( */}

      <div
        className={classes.divContainer}
        style={{
          marginTop: 32,
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
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
        <Button
          variant="contained"
          color="secondary"
          size="large"
          className={classes.button}
          startIcon={<DonateIcon />}
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
      </div>
      <div
        className={classes.divContainer}
        style={{
          marginTop: 32,
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        <Button
          // variant="contained"
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
      {/* )} */}

      {/* {connected && (
        <div
          className={classes.divContainer}
          style={{
            marginTop: 32,
            marginBottom: 32,
            textAlign: 'center',
          }}
        >
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
                  debugger;
                  router.history.push('/submit-proposal');
                };
                connect();
              }
            }}
          >
            Submit Proposal
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            className={classes.button}
            startIcon={<DonateIcon />}
            onClick={() => {
              if (connected) {
                router.history.push('/deposit');
              } else {
                const connect = async () => {
                  await web3Connect.triggerConnect();
                  debugger;
                  router.history.push('/deposit');
                };
                connect();
              }
            }}
          >
            Fund Projects
          </Button>
        </div>
      )} */}
      {/* <WalletProfile /> */}
      {/* <SubmitProposal /> */}
    </>
  );
};

export default Home;
