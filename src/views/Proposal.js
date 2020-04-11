import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Box from '3box';

import useWeb3Connect from '../utils/useWeb3Connect';
import useRouter from '../utils/useRouter';

import DepositIcon from '@material-ui/icons/AllInclusive';
import TwitterIcon from '@material-ui/icons/Twitter';

import { makeStyles } from '@material-ui/styles';
import { Typography, Button, Grid } from '@material-ui/core';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { IconButton, Tooltip, Link } from '@material-ui/core';

import Page from '../components/Page';
import Header from '../components/Header';
import ProposalCard from '../components/ProposalCard';
import EllipsisLoader from '../components/EllipsisLoader';

import { FIREBASE_FUNCTIONS_ENDPOINT } from '../config/firebase';
import { twitterHandleAlreadyLinked } from '../modules/twitterDb';
import { getUrlByHash } from '../modules/pinata';

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

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    position: 'relative',
    width: '100%',
  },
  button: {
    width: 190,
  },
  image: {
    display: 'block',
    maxHeight: '300px',
    maxWidth: '100%',
  },
}));

const Proposal = ({ match }) => {
  const web3Connect = useWeb3Connect();
  const { proposals, fetched } = web3Connect;
  const proposal_id = match.params.proposal_id;
  const classes = useStyles();
  const router = useRouter();
  const [status, setStatus] = useState('DRAFT');

  proposals[proposal_id] = {
    team: ['@wildcards_world'],
    emoji: '🦍',
    image: 'QmYt5pQuJzjAA6wbZKZk4PRze6eCphGDsSfEvBVHgzDi9j',
    title: 'Wildcards',
    website: 'https://wildcards.world',
    description:
      'We use radical economics to raise money through having always for sale tokens. Check it out!!',
    ownerTwitter: 'jonjonclark',
    shortDescription:
      'conservation tokens raising money for endangered animals',
    id: 2,
    owner: '0x2999Fe533BC08A03304C96E8668BfA17D9D0D35b',
  };

  const canVoteWithDelegate =
    status === 'ENABLED' ||
    (status !== '3BOX_VERIFIED' && web3Connect.enabledTwitter);

  const [canVoteViaTwitter, setCanVoteViaTwitter] = useState(false);

  const address = web3Connect.address;

  const enableTwitter = async () => {
    setStatus('3BOX_VERIFICATION');
    const profile = await Box.getProfile(address);
    const verified = await Box.getVerifiedAccounts(profile);
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

  const voteTwitter = (emoji) => {
    let url =
      'https://twitter.com/intent/tweet?text=' +
      encodeURI(`I am voting for proposal ~${emoji} on `) +
      '%23' +
      encodeURI(`DAOcare - A no loss funding DAO @dao_care`);
    var win = window.open(url, '_blank');
    win.focus();
  };

  // If the user has delegated the voting && the firebase database doesn't have the correct value for their address/twitter handle. This code will fix it.
  useEffect(() => {
    if (canVoteWithDelegate) {
      Box.getProfile(web3Connect.address).then(async (profile) => {
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
      title={`dao.care | ${' '}${
        proposals[proposal_id] !== undefined
          ? proposals[proposal_id].emoji
          : 'Loading'
      } Proposal`}
    >
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        {status === 'DRAFT' &&
          !web3Connect.enabledTwitter &&
          web3Connect.connected &&
          web3Connect.daiDeposit > 0 && (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<TwitterIcon />}
              onClick={enableTwitter}
            >
              Enable Twitter voting
            </Button>
          )}
        {status === '3BOX_VERIFICATION' && (
          <Typography variant="caption">
            Verifying 3Box twitter
            <EllipsisLoader />
          </Typography>
        )}
        {status === '3BOX_VERIFIED' && (
          <Typography variant="caption">
            Enabling twitter voting
            <EllipsisLoader />
          </Typography>
        )}
        {canVoteWithDelegate &&
          (canVoteViaTwitter ? (
            <Typography variant="caption">
              You can now vote with twitter
            </Typography>
          ) : (
            <Typography variant="caption">
              Voting on twitter has been enabled, validating on backend
              <EllipsisLoader />
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
      {/* {web3Connect.daiDeposit === 0 && web3Connect.connected && (
        <>
          <Typography variant="body2" className={classes.decriptionBlurb}>
            Deposit funds in the pool in order to vote on your favourite
            proposal
          </Typography>
          <div style={{ margin: '16px 0px' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              className={classes.button}
              startIcon={<DepositIcon />}
              onClick={() => {
                router.history.push('/deposit');
              }}
            >
              Deposit
            </Button>
          </div>
        </>
      )} */}
      <div style={{ marginTop: 16 }}>
        {/* {fetched &&
        proposals[proposal_id] != undefined && ( // for testing */}
        <Grid container justify="space-between" spacing={2}>
          <Grid item xs={12} md={6}>
            {/* const { title, shortDescription, website, image, id, emoji } = props.proposal; */}

            <img
              src={getUrlByHash(proposals[proposal_id].image)}
              alt="proposal image"
              className={classes.image}
            />
            <Typography variant="caption" align="center">
              {proposals[proposal_id].shortDescription}
            </Typography>

            {/* <ProposalCard
                    proposal={proposal}
                    votingAllowed={votingAllowed}
                    twitterAllowed={!web3Connect.connected || votingAllowed}
                    vote={web3Connect.contracts.dao.methods.vote}
                    isPreviousWinner={
                      proposal.id == web3Connect.previousWinnerId
                    }
                    address={address}
                  /> */}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h3" className={classes.title}>
              {proposals[proposal_id].emoji +
                ' ' +
                proposals[proposal_id].title}
            </Typography>
            <Typography variant="caption" align="center">
              <Link href={proposals[proposal_id].website} target="_blank">
                {proposals[proposal_id].website}
              </Link>
            </Typography>
            <br />
            <br />
            <Typography variant="body1" align="left">
              {proposals[proposal_id].description}
            </Typography>
            <br />
            <Typography variant="caption" align="center">
              Proposer:{' '}
              <Link
                href={
                  'https://twitter.com/' + proposals[proposal_id].ownerTwitter
                }
                target="_blank"
              >
                @{proposals[proposal_id].ownerTwitter}
              </Link>
            </Typography>
            {votingAllowed && !(proposal_id == web3Connect.previousWinnerId) && (
              <Tooltip title="Vote using your wallet">
                <IconButton
                  color="primary"
                  aria-label="vote"
                  onClick={() =>
                    web3Connect.contracts.dao.methods.vote(proposal_id)
                  }
                >
                  <HowToVoteIcon />
                </IconButton>
              </Tooltip>
            )}
            {(!web3Connect.connected || votingAllowed) &&
              !(proposal_id == web3Connect.previousWinnerId) && (
                <Tooltip title="Vote via Twitter">
                  <IconButton
                    color="secondary"
                    aria-label="vote via twitter"
                    onClick={() => voteTwitter(proposals[proposal_id].emoji)}
                  >
                    <TwitterIcon />
                  </IconButton>
                </Tooltip>
              )}
          </Grid>
        </Grid>
        {/* )} */}
        {!fetched && (
          <Typography variant="caption" align="center">
            Loading proposal
            <EllipsisLoader />
          </Typography>
        )}
      </div>
    </Page>
  );
};

Proposal.propTypes = {
  className: PropTypes.string,
};

export default Proposal;
