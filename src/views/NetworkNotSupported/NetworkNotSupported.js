import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import useWeb3Connect from '../../utils/useWeb3Connect';
import AddIcon from '@material-ui/icons/Add';
import { Typography, Button } from '@material-ui/core';
import useRouter from '../../utils/useRouter';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import useInterval from '../../utils/useInterval';
import { Page } from '../../components';

import DonateIcon from '@material-ui/icons/AllInclusive';
import Header from '../../components/Header';

const useStyles = makeStyles(theme => ({
  button: {
    margin: 32,
    width: 220,
  },
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
    <Page
      className={classes.root}
      title={`dao.care | ${web3Connect.network} not supported`}
    >
      <div style={{ marginBottom: 16 }}>
        <Typography
          variant="body1"
          style={{
            marginTop: 16,
            textAlign: 'center',
            color: '#A362A5',
            fontWeight: 400,
          }}
        >
          We are not yet supporting {web3Connect.network}, please connect to{' '}
          {web3Connect.supportedNetwork}
        </Typography>
      </div>
      <div
        className={classes.divContainer}
        style={{
          marginTop: 32,
          marginBottom: 32,
          textAlign: 'center',
        }}
      >
        <img
          style={{ maxWidth: '100%', maxHeight: 280 }}
          src="/network-not-supported.svg"
          alt="Network not supported"
        />
      </div>
      {/* <div
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
      </div> */}
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
    </Page>
  );
};

export default Home;
