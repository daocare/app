import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import AddIcon from '@material-ui/icons/PersonAdd';
import InfoIcon from '@material-ui/icons/Info';

import Page from '../components/Page';
import Header from '../components/Header';
import IpfsUpload from '../components/IpfsUpload';
import ProposalCard from '../components/ProposalCard';
// import EllipsisLoader from './EllipsisLoader';

import use3Box from '../utils/use3Box';
import useRouter from '../utils/useRouter';
import useInterval from '../utils/useInterval';
import useDaiContract from '../utils/useDaiContract';
import useDepositContract from '../utils/useDepositContract';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';
import {
  open3Box,
  isLoggedIn,
  isFetching,
  getSpace,
  getBox,
} from '../utils/3BoxManager';
import { emojiExists } from '../modules/twitterDb';
import { pinHash, getUrlByHash } from '../modules/pinata';

import { useForm } from 'react-hook-form';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import * as Showdown from 'showdown';
import ReactMde from 'react-mde';
import 'react-mde/lib/styles/css/react-mde-all.css';

const BN = require('bn.js');

const STAKING_AMOUNT = 50;

const useStyles = makeStyles((theme) => ({
  textField: {
    margin: theme.spacing(1, 0),
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(2),
    },
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
  button: {
    width: 190,
  },
  stepContent: {
    padding: 32,
  },
  step3Box: {
    textAlign: 'center',
  },
}));

const SubmitProposal = (props) => {
  const [status, setStatus] = useState('DRAFT');
  const classes = useStyles();
  const router = useRouter();
  const threeBoxData = use3Box();
  const daiContract = useDaiContract();
  const depositContract = useDepositContract();

  const {
    daiDeposit,
    hasAProposal,
    address,
    threeBox,
    daiBalance,
    daiAllowance,
  } = useSelector((state) => state.user);

  const provider = useSelector((state) => state.web3.provider);

  const chainId = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);

  const [activeStep, setActiveStep] = React.useState(0);
  const [check3BoxProfile, setCheck3BoxProfile] = React.useState(false);
  const [spaceStatus, setSpaceStatus] = React.useState(null);

  const [chosenEmoji, setChosenEmoji] = useState(null);
  const [emojiError, setEmojiError] = useState(false);
  const [team, setTeam] = React.useState([]);
  const [currentTeamMember, setCurrentTeamMember] = React.useState('');

  const [descriptionValue, setDescriptionValue] = React.useState('');
  const [selectedTab, setSelectedTab] = React.useState('write');

  const [ipfsImage, setIpfsImage] = React.useState(null);

  const [threadAddress, setThreadAddress] = React.useState(null);
  const [proposal, setProposal] = React.useState(
    null
    // {
    //   title: 'Test Proposal',
    //   shortDescription: 'We are coming to mainnet soon!',
    //   website: 'https://avolabs.io',
    //   image: getUrlByHash('QmckEm47utHmuw5Z5tXCXmsUj6WiUoNxX3B8C2RhWdG6EQ'),
    //   description: 'Soon soon :)',
    // }
  );

  const onEmojiClick = async (event, emojiObject) => {
    setChosenEmoji('loading');
    event.preventDefault();
    console.log('chainId');
    console.log(chainId);
    let networkSuffix = chainId == 42 ? '-kovan' : '';
    console.log(networkSuffix);
    if (await emojiExists(emojiObject.emoji, networkSuffix)) {
      setChosenEmoji(emojiObject);
      setEmojiError('This emoji is already being used by another proposal');
    } else {
      setChosenEmoji(emojiObject);
      setEmojiError('');
    }
  };

  useEffect(() => {
    threeBoxData.update3BoxDetails();
    console.log('aaaaaddress');
    console.log(address);
    if (!isFetching()) {
      open3Box(address, provider, setSpaceStatus);
      console.log('opened3box');
    }
  }, [address, provider, isFetching()]);

  // TODO fix this shitty looping flow
  useInterval(async () => {
    console.log('I run every 3 seconds');
    if (getBox() === null && threeBox['isLoggedIn'] && !isFetching()) {
      console.log('TRYING TO OPEN BOX');
      open3Box(address, provider, setSpaceStatus);
    }
    if (
      threeBox['isLoggedIn'] &&
      // !isFetching() &&
      getSpace() !== null &&
      activeStep === 0
    ) {
      setActiveStep(1);
    }
    if (check3BoxProfile) {
      console.log('I am checking if 3box has been created...');
      await threeBoxData.update3BoxDetails();

      if (threeBox['profile'] && threeBox['verifiedAccounts']['twitter']) {
        setCheck3BoxProfile(false);
      }
    }
  }, 3000);

  useRedirectHomeIfNoEthAccount();

  const { register, handleSubmit, watch, errors } = useForm();

  const addTeamMember = (handle) => {
    let newTeam = team;
    newTeam.push(handle);
    setTeam(newTeam);
  };

  const removeTeamMember = (handle) => () => {
    let newTeam = team.filter((member) => handle !== member);
    setTeam(newTeam);
  };

  const onSubmit = async (data) => {
    if (Object.keys(validationErrors()).length !== 0) {
      console.log('Not all fields are filled-in...');
      return;
    }
    setStatus('STORING_PROPOSAL');

    let space = getSpace();
    if (!space) {
      throw Error("Space can't be empty at this stage...");
    }

    const thread = await space.joinThread('proposal');

    console.log(thread);

    let currentPosts = await thread.getPosts();
    console.log(currentPosts);

    // delete existing thread posts
    for (let i = 0; i < currentPosts.length; i++) {
      let postId = currentPosts[i].postId;
      await thread.deletePost(postId);
    }

    let body = {
      ...data,
      image: ipfsImage.hash,
      description: descriptionValue,
      team,
      emoji: chosenEmoji.emoji,
      ownerTwitter: threeBox['verifiedAccounts']['twitter']['username'],
    };
    console.log(body);

    await thread.post(body);

    let newPosts = await thread.getPosts();
    console.log(newPosts);

    setThreadAddress(thread.address);
    setProposal(body);
    setActiveStep(2);
    setStatus('PROPOSAL_STORED');
  };
  const validationErrors = () => {
    let result = { ...errors };

    const isEmpty = (str) => !str || str.trim() === '';

    let values = watch();

    if (isEmpty(values.title)) result.title = "Title can't be empty";
    if (isEmpty(values.shortDescription))
      result.shortDescription = "Short description can't be empty";
    if (isEmpty(values.website)) result.website = "Website can't be empty";
    if (!chosenEmoji || emojiError) result.emoji = "Emoji can't be empty";
    if (!ipfsImage) result.logo = "Logo can't be empty";
    if (isEmpty(descriptionValue)) result.logo = "Description can't be empty";

    return result;
  };

  const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true,
  });

  return (
    <Page title="dao.care | submit proposal">
      <Header />

      {false ? (
        <Typography variant="body2">
          dao.care will be accepting proposal submissions from the 30th of July.
        </Typography>
      ) : (
        <>
          {daiDeposit > 0 && (
            <Typography variant="body2">
              To afford maximum smart contract security we limit accounts that
              are already part of the fund from submitting a proposal. Please
              use another account to submit a proposal.
            </Typography>
          )}
          {hasAProposal && (
            <Typography variant="body2">
              It looks like you have already submitted a proposal with this
              account.
            </Typography>
          )}
          {daiBalance !== null && daiBalance < STAKING_AMOUNT && (
            <>
              <Typography
                variant="body2"
                component="span"
                style={{
                  color: '#FF9494',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                You do not have enough DAI in your wallet to submit a proposal
              </Typography>
              <Typography variant="body2">
                <InfoIcon fontSize="inherit" /> In order to submit a proposal
                you will be required to stake 50 DAI. You can withdraw your
                stake with your proposal.
              </Typography>
            </>
          )}
          {!hasAProposal && (daiDeposit === 0 || daiDeposit == null) && (
            <>
              <Typography variant="h5" className={classes.title}>
                Submit Proposal
              </Typography>
              <Typography variant="body2">
                <InfoIcon fontSize="inherit" /> In order to submit a proposal
                you will be required to stake 50 DAI. You can withdraw your
                stake with your proposal.
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                <Step>
                  <StepLabel>3Box verification</StepLabel>
                  <StepContent>
                    <div className={classes.stepContent}>
                      <div className={classes.step3Box}>
                        <a
                          href="https://3box.io/hub"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setCheck3BoxProfile(true)}
                        >
                          <img
                            src="/3box-cloud.svg"
                            alt="3Box"
                            style={{
                              width: 200,
                              display: 'block',
                              margin: 'auto',
                              marginBottom: 16,
                              cursor: 'pointer',
                            }}
                          />
                        </a>
                        {!threeBox['profile'] && (
                          <>
                            <Typography
                              variant="body2"
                              gutterBottom
                              style={{ marginBottom: 16 }}
                            >
                              In order to submit a proposal, you need to verify
                              your profile and twitter account with{' '}
                              <a
                                href="https://3box.io/hub"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setCheck3BoxProfile(true)}
                              >
                                3Box
                              </a>
                            </Typography>
                            {/* <Button
                          variant="contained"
                          color="primary"
                          onClick={handleNext}
                          className={classes.button}
                        >
                          Create Profile
                        </Button> */}
                          </>
                        )}
                        {threeBox['profile'] &&
                          (!threeBox['verifiedAccounts'] ||
                            !threeBox['verifiedAccounts']['twitter']) && (
                            <Typography
                              variant="body2"
                              gutterBottom
                              style={{ marginBottom: 16 }}
                            >
                              We still need to know your twitter profile, please
                              use 3Box to verify your twitter
                            </Typography>
                          )}
                        {threeBox['profile'] &&
                          threeBox['verifiedAccounts'] &&
                          threeBox['verifiedAccounts']['twitter'] && (
                            <>
                              <Typography
                                variant="body2"
                                gutterBottom
                                style={{ marginBottom: 16 }}
                              >
                                {!spaceStatus && (
                                  <span>
                                    We found your 3Box profile with a verified
                                    twitter account!
                                    <br />
                                    We now need to open a dao.care space on your
                                    3Box.
                                  </span>
                                )}
                                {spaceStatus && <span>{spaceStatus}</span>}
                              </Typography>
                              <Button
                                variant="contained"
                                color="primary"
                                className={classes.button}
                                onClick={async () => {
                                  await open3Box(
                                    address,
                                    provider,
                                    setSpaceStatus
                                  );
                                  setActiveStep(1);
                                }}
                                disabled={spaceStatus !== null}
                              >
                                Open 3Box Space
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Proposal details</StepLabel>
                  <StepContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <>
                        <TextField
                          fullWidth
                          label="Title"
                          name="title"
                          variant="outlined"
                          inputRef={register({ required: true })}
                          className={clsx(classes.flexGrow, classes.textField)}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Short Description"
                          name="shortDescription"
                          variant="outlined"
                          inputRef={register({ required: true })}
                          className={clsx(classes.flexGrow, classes.textField)}
                          required
                        />
                        <TextField
                          fullWidth
                          label="Website"
                          name="website"
                          variant="outlined"
                          inputRef={register({ required: true })}
                          className={clsx(classes.flexGrow, classes.textField)}
                          required
                        />
                        <Typography
                          variant="body1"
                          display="block"
                          className={classes.textField}
                        >
                          Emoji *
                          {chosenEmoji != 'loading' && chosenEmoji != null && (
                            <span
                              role="img"
                              aria-label={chosenEmoji.names.join(', ')}
                              onClick={() => setChosenEmoji(null)}
                            >
                              {' '}
                              {chosenEmoji.emoji}
                            </span>
                          )}
                          {emojiError && (
                            <span style={{ color: 'red' }}> {emojiError}</span>
                          )}
                        </Typography>
                        {chosenEmoji == null && (
                          <Picker
                            onEmojiClick={onEmojiClick}
                            skinTone={SKIN_TONE_MEDIUM_DARK}
                          />
                        )}
                        <Typography
                          variant="body1"
                          display="block"
                          className={classes.textField}
                        >
                          Description *
                        </Typography>

                        <ReactMde
                          value={descriptionValue}
                          onChange={setDescriptionValue}
                          selectedTab={selectedTab}
                          onTabChange={setSelectedTab}
                          generateMarkdownPreview={(markdown) =>
                            Promise.resolve(converter.makeHtml(markdown))
                          }
                        />
                        <Typography variant="caption">
                          This editor supports{' '}
                          <a
                            href="https://www.markdownguide.org/basic-syntax/"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            markdown style
                          </a>
                        </Typography>
                        <Typography
                          variant="body1"
                          display="block"
                          className={classes.textField}
                        >
                          Team *
                        </Typography>
                        <div>
                          {team.map((member) => (
                            <Chip
                              key={member}
                              avatar={
                                <Avatar
                                  alt={member}
                                  src={'https://avatars.io/twitter/' + member} //TODO this doesn't seem to work
                                />
                              }
                              label={member}
                              onDelete={removeTeamMember(member)}
                            />
                          ))}
                        </div>
                        <div className={classes.wrapper}>
                          <TextField
                            label="Twitter handle"
                            variant="outlined"
                            size="small"
                            className={clsx(
                              classes.flexGrow,
                              classes.textField
                            )}
                            style={{ width: 200 }}
                            value={currentTeamMember}
                            onChange={(e) =>
                              setCurrentTeamMember(e.target.value)
                            }
                            onKeyPress={(ev) => {
                              if (ev.key === 'Enter') {
                                addTeamMember(currentTeamMember);
                                setCurrentTeamMember('');
                                ev.preventDefault();
                              }
                            }}
                          />
                          <Tooltip title="Add team member">
                            <IconButton
                              color="secondary"
                              aria-label="add"
                              style={{ marginTop: 4, marginLeft: -8 }}
                              onClick={(e) => {
                                addTeamMember(currentTeamMember);
                                setCurrentTeamMember('');
                              }}
                            >
                              <AddIcon fontSize="inherit" />
                            </IconButton>
                          </Tooltip>
                        </div>

                        <Typography
                          variant="body1"
                          display="block"
                          className={classes.textField}
                        >
                          Logo *
                        </Typography>
                        <IpfsUpload
                          fileUploadedCB={(url, hash) => {
                            console.log({ url, hash });
                            setIpfsImage({ url, hash });
                            pinHash(hash, address + '-logo');
                          }}
                          caption={'Select image'}
                        />
                        {ipfsImage && (
                          <img
                            style={{ maxWidth: 200 }}
                            alt="Logo"
                            src={ipfsImage.url}
                          />
                        )}
                      </>
                      <div
                        style={{
                          width: '100%',
                          textAlign: 'center',
                          padding: 32,
                        }}
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          className={classes.storeButton}
                          type="submit"
                          style={{ marginBottom: 16 }}
                          disabled={
                            // (status !== 'DRAFT' && status !== 'DAI_APPROVED') ||
                            // daiAllowance === 0 ||
                            // daiBalance < STAKING_AMOUNT
                            Object.keys(validationErrors()).length !== 0 ||
                            status === 'STORING_PROPOSAL'
                          }
                        >
                          Store Proposal
                        </Button>
                        {status === 'STORING_PROPOSAL' && (
                          <Typography
                            variant="body2"
                            component="span"
                            display="block"
                          >
                            Storing proposal to 3Box...
                          </Typography>
                        )}
                      </div>
                    </form>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>Stake and submit</StepLabel>
                  <StepContent>
                    {/* <Typography variant="body1" style={{ marginTop: 16 }}>
                  Review your proposal
                </Typography> */}
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <ProposalCard
                        proposal={proposal}
                        votingAllowed={false}
                        twitterAllowed={false}
                        // address={address}
                        style={{ margin: 'auto' }}
                      />
                    </div>
                    <Tooltip title="This amount will be added to the pool and you will be able to recoup it back after removing your proposal">
                      <Typography
                        variant="body1"
                        style={{ marginTop: 32, textAlign: 'center' }}
                      >
                        In order to submit a proposol you need to stake{' '}
                        {STAKING_AMOUNT} DAI
                      </Typography>
                    </Tooltip>

                    <div
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: 32,
                      }}
                    >
                      {/* <Tooltip 
                      //   title={`This operation will ${
                      //     daiAllowance === null || daiAllowance < STAKING_AMOUNT
                      //       ? `first allow dao.care to extract ${STAKING_AMOUNT} DAI from your wallet and then `
                      //       : ''
                      //   }transfer ${STAKING_AMOUNT} DAI to the pool in order to submit your proposal`}
                      //   placement="top"
                      // >*/}
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        // disabled={
                        //   daiBalance === null ||
                        //   daiBalance < STAKING_AMOUNT ||
                        //   status !== 'PROPOSAL_STORED'
                        // } TODO
                        onClick={async () => {
                          let execute = async () => {
                            if (daiAllowance < STAKING_AMOUNT) {
                              setStatus('APPROVING_DAI');
                              await daiContract.triggerDaiApprove(
                                new BN(STAKING_AMOUNT)
                              );
                              setStatus('DAI_APPROVED');
                            }

                            setStatus('SUBMITTING_BLOCKCHAIN');

                            //TODO: Add emoji to firebase
                            fetch(
                              'https://us-central1-daocare-2e68d.cloudfunctions.net/registerEmoji',
                              {
                                method: 'post',
                                body: JSON.stringify({
                                  emoji: chosenEmoji.emoji,
                                  handle:
                                    threeBox['verifiedAccounts']['twitter'][
                                      'username'
                                    ],
                                  isTestnet: chainId != 1,
                                }),
                                headers: {
                                  'content-type': 'application/json',
                                },
                              }
                            ).then(async function (response) {
                              console.log(await response.json());
                            });

                            await depositContract.triggerSubmitProposal(
                              threadAddress
                            );

                            setStatus('SUBMITTED');
                          };
                          execute();
                        }}
                      >
                        Stake &amp; Submit
                      </Button>
                      <Typography
                        variant="body2"
                        component="span"
                        style={{
                          textAlign: 'center',
                          display: 'block',
                        }}
                      >
                        Please do not leave or refresh this page until the
                        transaction has been completed
                      </Typography>
                      {/* </Tooltip> */}
                      <div style={{ paddingTop: 16 }}>
                        {status === 'APPROVING_DAI' && (
                          <Typography
                            variant="body2"
                            component="span"
                            style={{
                              textAlign: 'center',
                              display: 'block',
                            }}
                          >
                            Please allow the transfer of {STAKING_AMOUNT} DAI
                            from your wallet...
                          </Typography>
                        )}
                        {status === 'SUBMITTING_BLOCKCHAIN' && (
                          <Typography
                            variant="body2"
                            component="span"
                            style={{
                              textAlign: 'center',
                              display: 'block',
                            }}
                          >
                            Please confirm the submission of your proposal on
                            your wallet...
                          </Typography>
                        )}
                        {status === 'SUBMITTED' && (
                          <>
                            <Typography
                              variant="body2"
                              component="span"
                              style={{
                                textAlign: 'center',
                                display: 'block',
                              }}
                            >
                              Your proposal was submitted successfully
                            </Typography>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="large"
                              startIcon={<HowToVoteIcon />}
                              onClick={() => {
                                router.history.push('/proposals');
                              }}
                              style={{ marginTop: 32 }}
                            >
                              All Proposals
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </StepContent>
                </Step>
              </Stepper>
            </>
          )}
        </>
      )}
    </Page>
  );
};

SubmitProposal.propTypes = {
  className: PropTypes.string,
};

export default SubmitProposal;
