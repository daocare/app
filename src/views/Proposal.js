import React, { useState, useEffect } from 'react';

import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import Box from '3box';

// import useWeb3Connect from '../utils/useWeb3Connect';
import useDaoContract from '../utils/useDaoContract';
import useRouter from '../utils/useRouter';
import {
  linkTwitterHandleToEthAddressInFirebase,
  voteTwitter,
} from '../utils/twitterUtils';

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
import PreviousWinnerBadge from '../components/PreviousWinnerBadge';

import { twitterHandleAlreadyLinked } from '../modules/twitterDb';
import { getUrlByHash } from '../modules/pinata';

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
  // const web3Connect = useWeb3Connect();
  const daoContract = useDaoContract();

  const { proposals, fetched } = useSelector((state) => state.proposals);
  const {
    connected,
    address,
    enabledTwitter,
    daiDeposit,
    hasAProposal,
  } = useSelector((state) => state.user);

  const lastWinner = useSelector((state) => state.iteration.lastWinner);

  const proposal_id = match.params.proposal_id;
  const classes = useStyles();
  const router = useRouter();
  const [status, setStatus] = useState('DRAFT');

  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (fetched) {
      setProposal(
        proposals.find((proposal) => proposal.id == match.params.proposal_id)
      );
    }
  }, [fetched]);

  const canVoteWithDelegate =
    status === 'ENABLED' || (status !== '3BOX_VERIFIED' && enabledTwitter);

  const [canVoteViaTwitter, setCanVoteViaTwitter] = useState(false);

  const enableTwitter = async () => {
    setStatus('3BOX_VERIFICATION');
    const profile = await Box.getProfile(address);
    const verified = await Box.getVerifiedAccounts(profile);
    if (verified && verified.twitter && verified.twitter.username) {
      setStatus('3BOX_VERIFIED');
      let tx = await daoContract.enableTwitterVoting();
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

  // If the user has delegated the voting && the firebase database doesn't have the correct value for their address/twitter handle. This code will fix it.
  useEffect(() => {
    if (canVoteWithDelegate) {
      Box.getProfile(address).then(async (profile) => {
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
    // web3Connect.currentVote === null && TODO
    daiDeposit > 0 && hasAProposal === false;

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
        {status === 'DRAFT' && !enabledTwitter && connected && daiDeposit > 0 && (
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
      <div style={{ marginTop: 16 }}>
        {proposal !== null && (
          // for testing
          <Grid container justify="space-between" spacing={2}>
            <Grid item xs={12} md={6}>
              {/* const { title, shortDescription, website, image, id, emoji } = props.proposal; */}

              <img
                src={getUrlByHash(proposal.image)}
                alt="proposal image"
                className={classes.image}
              />
              <Typography variant="caption" align="center">
                {proposal.shortDescription}
              </Typography>
              {proposal.id == lastWinner && <PreviousWinnerBadge />}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h3" className={classes.title}>
                {proposal.emoji + ' ' + proposal.title}
              </Typography>
              <Typography variant="caption" align="center">
                <Link
                  href={proposal.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {proposal.website}
                </Link>
              </Typography>
              <br />
              <br />
              <Typography variant="body1" align="left">
                {proposal.description}
              </Typography>
              <br />
              <Typography variant="caption" align="center">
                Proposer:{' '}
                <Link
                  href={'https://twitter.com/' + proposal.ownerTwitter}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{proposal.ownerTwitter}
                </Link>
              </Typography>
              {votingAllowed && !(proposal_id == lastWinner) && (
                <Tooltip title="Vote using your wallet">
                  <IconButton
                    color="primary"
                    aria-label="vote"
                    onClick={() => daoContract.vote(proposal_id)}
                  >
                    <HowToVoteIcon />
                  </IconButton>
                </Tooltip>
              )}
              {(connected || votingAllowed) && !(proposal_id == lastWinner) && (
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
        )}
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
