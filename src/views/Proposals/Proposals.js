import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import DonateIcon from '@material-ui/icons/AllInclusive';
import TwitterIcon from '@material-ui/icons/Twitter';
import Box from '3box';

import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import useRouter from '../../utils/useRouter';
import { Page } from '../../components';
import Header from '../../components/Header/Header';
import useWeb3Connect from '../../utils/useWeb3Connect';
import ProposalCard from '../../components/ProposalCard';
import { FIREBASE_FUNCTIONS_ENDPOINT } from '../../config/firebase';
import { twitterHandleAlreadyLinked } from '../../modules/twitterDb';

const linkTwitterHandleToEthAddressInFirebase = async (
  handle,
  address,
  txHash
) => {
  const response = await fetch(
    FIREBASE_FUNCTIONS_ENDPOINT + '/registerTwitterHandle',
    {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        handle,
        address,
        txHash,
      }), // body data type must match "Content-Type" header
    }
  );
  return await response.json();
};
const useStyles = makeStyles(theme => ({
  root: {
    // backgroundColor: theme.palette.white
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  paper: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '75%',
      minWidth: 180,
    },
    width: '100%',
    padding: theme.spacing(3),
  },
  title: {
    // marginBottom: theme.spacing(2),
  },
  textField: {
    margin: theme.spacing(1, 0),
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(2),
    },

    // fontWeight: "0.8em"
    // minWidth: 150
  },
  subscribeButton: {
    // padding: theme.spacing(0, 1)
  },
  fieldGroup: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      marginTop: theme.spacing(1),
    },

    alignItems: 'center',
  },
  flexGrow: {
    flexGrow: 1,
  },
  wrapper: {
    position: 'relative',
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      marginTop: theme.spacing(2),
    },
    marginTop: theme.spacing(2),
  },
  hiddenImage: {
    display: 'none',
  },
  image: {
    display: 'block',
  },
  statusMsg: {
    marginLeft: 16,
  },
  button: {
    width: 190,
  },
  card: {
    width: 210,
    height: 370,
  },
  decriptionBlurb: { margin: '16px 0' },
}));

const Proposals = () => {
  const web3Connect = useWeb3Connect();
  const { proposals, fetched } = web3Connect;
  const classes = useStyles();
  const router = useRouter();
  const [status, setStatus] = useState('DRAFT');
  const canVoteWithDelegate =
    status === 'ENABLED' ||
    (status !== '3BOX_VERIFIED' && web3Connect.enabledTwitter);
  const [canVoteViaTwitter, setCanVoteViaTwitter] = useState(false);
  const address = web3Connect.address;

  const enableTwitter = async () => {
    setStatus('3BOX_VERIFICATION');
    const profile = await Box.getProfile(address);
    console.log(profile);
    const verified = await Box.getVerifiedAccounts(profile);
    console.log(verified);
    if (verified && verified.twitter && verified.twitter.username) {
      setStatus('3BOX_VERIFIED');
      let tx = await web3Connect.contracts.dao.methods.enableTwitterVoting();
      if (!tx) {
        setStatus('TX_FAILED');
      } else {
        let txHash = tx.transactionHash;
        try {
          let result = await linkTwitterHandleToEthAddressInFirebase(
            verified.twitter.username,
            address,
            txHash
          );
          console.log({ result });
          setStatus('ENABLED');
        } catch (error) {
          console.error(error);
          setStatus('TX_FAILED');
        }
      }
    } else {
      setStatus('3BOX_FAILED');
    }
  };

  // IF the user has delegated the voting && the firebase database dosen't have the correct value for their address/twitter handle. This code will fix it.
  useEffect(() => {
    if (canVoteWithDelegate) {
      Box.getProfile(web3Connect.address).then(async profile => {
        const verified = await Box.getVerifiedAccounts(profile);
        const twitterIsVerified =
          verified && verified.twitter && verified.twitter.username;

        if (twitterIsVerified) {
          const twitterUsername = verified.twitter.username;
          const isTwitterHandleLinkedToAddressInFirebase = await twitterHandleAlreadyLinked(
            twitterUsername,
            address
          );

          if (!isTwitterHandleLinkedToAddressInFirebase) {
            await linkTwitterHandleToEthAddressInFirebase(
              twitterUsername,
              address,
              null /* The hxHash is null here, since the transaction happened in the past */
            );
          }
          // TODO: check that the firebase function was successful. Now just assuming it is ok. Should be ok if nothing changes.
          setCanVoteViaTwitter(true);
        }
      });
    }
  }, [canVoteWithDelegate]);

  let votingAllowed =
    web3Connect.currentVote === null &&
    web3Connect.daiDeposit > 0 &&
    web3Connect.hasProposal === false;

  return (
    <Page
      className={classes.root}
      title="dao.care | All Proposals"
      style={{ position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        {status === 'DRAFT' &&
          !web3Connect.enabledTwitter &&
          web3Connect.connected && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              // className={classes.button}
              startIcon={<TwitterIcon />}
              onClick={enableTwitter}
            >
              Enable Twitter voting
            </Button>
          )}
        {status === '3BOX_VERIFICATION' && (
          <Typography variant="caption">Verifying 3Box twitter</Typography>
        )}
        {status === '3BOX_VERIFIED' && (
          <Typography variant="caption">Enabling twitter voting</Typography>
        )}
        {canVoteWithDelegate &&
          (canVoteViaTwitter ? (
            <Typography variant="caption">
              You can now vote with twitter
            </Typography>
          ) : (
            <Typography variant="caption">
              Voting on twitter enabled, validating on backend
            </Typography>
          ))}
        {status === '3BOX_FAILED' && (
          <Typography variant="caption" style={{ color: '#FF9494' }}>
            3Box twitter verification failed
          </Typography>
        )}
        {status === 'TX_FAILED' && (
          <Typography variant="caption" style={{ color: '#FF9494' }}>
            Transaction failed, please check your wallet.{' '}
          </Typography>
        )}
      </div>
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        Deposit your DAI. Let your idle interest support community projects. The
        amount of DAI you stake in the fund determines the level of your voting
        power.
      </Typography>
      {web3Connect.daiDeposit === 0 && web3Connect.connected && (
        <>
          <div style={{ margin: 16, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              className={classes.button}
              startIcon={<DonateIcon />}
              onClick={() => {
                router.history.push('/deposit');
              }}
            >
              Deposit
            </Button>
          </div>
        </>
      )}
      {web3Connect.daiDeposit > 0 && !web3Connect.hasProposal && (
        <>
          <div style={{ margin: 16, textAlign: 'center' }}>
            <Typography variant="body1">
              You have a deposit of {web3Connect.daiDeposit} DAI
            </Typography>
          </div>
        </>
      )}
      {web3Connect.currentVote !== null && (
        <>
          <Typography variant="h5" className={classes.title}>
            Your vote
          </Typography>
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <ProposalCard
              proposal={web3Connect.currentVote}
              votingAllowed={false}
              twitterAllowed={false}
              address={address}
            />
          </div>
        </>
      )}

      <Typography variant="h5" className={classes.title}>
        All Proposals
      </Typography>
      <div style={{ marginTop: 16 }}>
        {fetched && proposals.length > 0 && (
          <>
            <Grid container justify="space-evenly" spacing={4}>
              {proposals.map(proposal => (
                <Grid key={proposal.id} item>
                  <div className={classes.card}>
                    <ProposalCard
                      proposal={proposal}
                      votingAllowed={votingAllowed}
                      twitterAllowed={!web3Connect.connected || votingAllowed}
                      vote={web3Connect.contracts.dao.methods.vote}
                      address={address}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {fetched && proposals.length === 0 && (
          <Typography variant="caption" align="center">
            No proposals available
          </Typography>
        )}
        {!fetched && (
          <Typography variant="caption" align="center">
            Loading proposals....
          </Typography>
        )}
      </div>
    </Page>
  );
};

Proposals.propTypes = {
  className: PropTypes.string,
};

export default Proposals;
