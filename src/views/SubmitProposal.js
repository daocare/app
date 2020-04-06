import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { useForm } from 'react-hook-form';
import useRouter from '../utils/useRouter';
import { pinHash } from '../modules/pinata';
import { Page } from '../components';
import Header from '../components/Header';
import useWeb3Connect from '../utils/useWeb3Connect';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import LoadingWeb3 from '../components/LoadingWeb3';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import useInterval from '../utils/useInterval';
import {
  open3Box,
  isLoggedIn,
  isFetching,
  // getBox,
  getSpace,
  getBox,
} from '../utils/3BoxManager';
import Picker, { SKIN_TONE_MEDIUM_DARK } from 'emoji-picker-react';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/PersonAdd';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ReactMde from 'react-mde';
// import ReactDOM from 'react-dom';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { emojiExists } from '../modules/twitterDb';
import IpfsUpload from '../components/IpfsUpload';
// import Box from '3box';
import ProposalCard from '../components/ProposalCard';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';

const BN = require('bn.js');

const STAKING_AMOUNT = 50;

const useStyles = makeStyles((theme) => ({
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
  stepContent: {
    padding: 32,
  },
  step3Box: {
    textAlign: 'center',
  },
  teamChips: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}));

const SubmitProposal = (props) => {
  const [status, setStatus] = useState('DRAFT');
  const classes = useStyles();
  const router = useRouter();

  const web3Connect = useWeb3Connect();

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
    //   {
    //   title: 'Wildcards',
    //   shortDescription: 'Always for sale ethereum conservation tokens',
    //   website: 'https://wildcards.world',
    //   image: getUrlByHash('QmckEm47utHmuw5Z5tXCXmsUj6WiUoNxX3B8C2RhWdG6EQ'),
    //   description: 'Bla Bla',
    // }
  );

  const onEmojiClick = async (event, emojiObject) => {
    event.preventDefault();
    console.log(emojiObject);
    let networkSuffix = web3Connect.chainId == 42 ? '-kovan' : '';
    if (await emojiExists(emojiObject.emoji, networkSuffix)) {
      setChosenEmoji(emojiObject);

      setEmojiError('This emoji is already being used by another proposal');
    } else {
      setChosenEmoji(emojiObject);
      setEmojiError('');
    }
  };

  useInterval(async () => {
    let is3BoxLoggedIn = await isLoggedIn(web3Connect.address);
    if (getBox() === null && is3BoxLoggedIn && !isFetching()) {
      console.log('TRYING TO OPEN BOX');
      open3Box(web3Connect.address, web3Connect.provider, setSpaceStatus);
    }
    if (
      is3BoxLoggedIn &&
      !isFetching() &&
      getSpace() !== null &&
      activeStep === 0
    ) {
      setActiveStep(1);
    }
    if (check3BoxProfile) {
      console.log('I am checking if 3box has been created...');
      let { profile, verifiedAccounts } = await web3Connect.update3BoxDetails();
      console.log({ verifiedAccounts });
      if (profile && verifiedAccounts.twitter) {
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
      ownerTwitter: web3Connect.userVerifiedAccounts.twitter.username,
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
    <Page className={classes.root} title="dao.care | submit proposal">
      {web3Connect.loadingWeb3 && (
        <>
          <LoadingWeb3 />
        </>
      )}

      {!web3Connect.loadingWeb3 && (
        <>
          <Header />
          <Typography variant="h5" className={classes.title}>
            Submit Proposal
          </Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            <Step>
              <StepLabel>3Box verification</StepLabel>
              <StepContent>
                <div className={classes.stepContent}>
                  {/* {web3Connect.is3BoxLoggedIn && ( */}
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
                    {!web3Connect.userProfile && (
                      <>
                        <Typography
                          variant="body2"
                          gutterBottom
                          style={{ marginBottom: 16 }}
                        >
                          In order to submit a proposal, you need to have a 3Box
                          profile with a twitter verification.
                          <br />
                          Please click on the 3Box cloud to create a profile on
                          3Box hub.
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
                    {web3Connect.userProfile &&
                      (!web3Connect.userVerifiedAccounts ||
                        !web3Connect.userVerifiedAccounts.twitter) && (
                        <Typography
                          variant="body2"
                          gutterBottom
                          style={{ marginBottom: 16 }}
                        >
                          We still need to know your twitter profile, please use
                          3Box to verify your twitter
                        </Typography>
                      )}
                    {web3Connect.userProfile &&
                      web3Connect.userVerifiedAccounts &&
                      web3Connect.userVerifiedAccounts.twitter && (
                        <>
                          <Typography
                            variant="body2"
                            gutterBottom
                            style={{ marginBottom: 16 }}
                          >
                            {!spaceStatus && (
                              <span>
                                We found your 3Box profile with a twitter
                                account!
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
                                web3Connect.address,
                                web3Connect.provider,
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
                      {chosenEmoji && (
                        <span
                          role="img"
                          aria-label={chosenEmoji.names.join(', ')}
                        >
                          {' '}
                          {chosenEmoji.emoji}
                        </span>
                      )}
                      {emojiError && (
                        <span style={{ color: 'red' }}> {emojiError}</span>
                      )}
                    </Typography>
                    <Picker
                      onEmojiClick={onEmojiClick}
                      skinTone={SKIN_TONE_MEDIUM_DARK}
                    />
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
                              src={'https://avatars.io/twitter/' + member}
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
                        className={clsx(classes.flexGrow, classes.textField)}
                        style={{ width: 200 }}
                        value={currentTeamMember}
                        onChange={(e) => setCurrentTeamMember(e.target.value)}
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
                        pinHash(hash, web3Connect.address + '-logo');
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
                    style={{ width: '100%', textAlign: 'center', padding: 32 }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.storeButton}
                      type="submit"
                      style={{ marginBottom: 16 }}
                      disabled={
                        // (status !== 'DRAFT' && status !== 'DAI_APPROVED') ||
                        // web3Connect.daiAllowance === 0 ||
                        // web3Connect.daiBalance < STAKING_AMOUNT
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
              <StepLabel>Stake &amp; Submit</StepLabel>
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
                {web3Connect.daiBalance !== null &&
                  web3Connect.daiBalance < STAKING_AMOUNT && (
                    <Typography
                      variant="body2"
                      component="span"
                      style={{
                        color: '#FF9494',
                        textAlign: 'center',
                        display: 'block',
                      }}
                    >
                      You don't have enough DAI on your wallet
                    </Typography>
                  )}
                <div
                  style={{ width: '100%', textAlign: 'center', padding: 32 }}
                >
                  <Tooltip
                    title={`This operation will ${
                      web3Connect.daiAllowance === null ||
                      web3Connect.daiAllowance < STAKING_AMOUNT
                        ? `first allow dao.care to extract ${STAKING_AMOUNT} DAI from your wallet and then `
                        : ''
                    }transfer ${STAKING_AMOUNT} DAI to the pool in order to submit your proposal`}
                    placement="top"
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      disabled={
                        web3Connect.daiBalance === null ||
                        web3Connect.daiBalance < STAKING_AMOUNT ||
                        status !== 'PROPOSAL_STORED'
                      }
                      onClick={async () => {
                        let execute = async () => {
                          if (web3Connect.daiAllowance < STAKING_AMOUNT) {
                            setStatus('APPROVING_DAI');
                            await web3Connect.contracts.dai.methods.triggerDaiApprove(
                              new BN(STAKING_AMOUNT)
                            );
                            setStatus('DAI_APPROVED');
                          }

                          setStatus('SUBMITTING_BLOCKCHAIN');

                          //TODO: Add emoji to firebase

                          await web3Connect.contracts.dao.methods.triggerSubmitProposal(
                            threadAddress
                          );

                          setStatus('SUBMITTED');
                        };
                        execute();
                      }}
                    >
                      Stake &amp; Submit
                    </Button>
                  </Tooltip>
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
                        Please allow the transfer of {STAKING_AMOUNT} DAI on
                        your wallet...
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
                        Please confirm the submission of your proposal on your
                        wallet...
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

          {!web3Connect.hasProposal && web3Connect.daiDeposit === 0 && <></>}
          {web3Connect.daiDeposit > 0 && (
            <p>
              You have already deposited and you can't add a proposal with the
              same account, please create a new one.
            </p>
          )}
          {web3Connect.hasProposal && <p>You already have a proposal</p>}
        </>
      )}
    </Page>
  );
};

SubmitProposal.propTypes = {
  className: PropTypes.string,
};

export default SubmitProposal;
