import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { useForm } from 'react-hook-form';
import useRouter from '../../utils/useRouter';
import { uploadJson } from '../../modules/pinata';
import { Page } from '../../components';
import Header from '../../components/Header';
import useWeb3Connect from '../../utils/useWeb3Connect';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
const BN = require('bn.js');

const STAKING_AMOUNT = 50;

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
}));

const SubmitProposal = props => {
  const [status, setStatus] = useState('DRAFT');
  const [image, setImage] = useState(false);
  const classes = useStyles();
  const router = useRouter();
  const web3Connect = useWeb3Connect();

  useEffect(() => {
    if (web3Connect.loaded && !web3Connect.connected) {
      router.history.push('/');
    }
  }, [web3Connect, router.history]);

  const { register, handleSubmit /* , watch */ /* , errors  */ } = useForm();

  const onSubmit = async data => {
    setStatus('IPFS_UPLOAD');
    // const { title, description } = data;
    console.log(data);

    let body = { ...data, image };

    let hash = await uploadJson(data.title, body);
    setStatus('SUBMITTING_BLOCKCHAIN');

    // console.log({ hash });
    // let json = await getJson(hash);
    // console.log({ json });
    await web3Connect.contracts.dao.methods.triggerSubmitProposal(hash);

    setStatus('SUBMITTED');
  };

  const previewFile = () => {
    const preview = document.getElementById('logoImg');
    const file = document.querySelector('input[type=file]').files[0];
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      function() {
        // convert image file to base64 string
        preview.src = reader.result;
        setImage(reader.result);
      },
      false
    );

    if (file) {
      reader.readAsDataURL(file);
    }
  };
  console.log({
    status,
    allowance: web3Connect.daiAllowance,
    balance: web3Connect.daiBalance,
  });
  return (
    <Page className={classes.root} title="dao.care | Submit Proposal">
      <Header />
      <Typography variant="h5" className={classes.title}>
        Submit Proposal
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* <Box className={classes.fieldGroup}> */}
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
          label="Description"
          name="description"
          variant="outlined"
          inputRef={register({ required: true })}
          className={clsx(classes.flexGrow, classes.textField)}
          multiline
          rows={5}
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
        <TextField
          fullWidth
          label="Team"
          name="team"
          variant="outlined"
          inputRef={register}
          className={clsx(classes.flexGrow, classes.textField)}
          multiline
          rows={3}
        />
        {/* <ImageUploader
          withIcon={true}
          buttonText="Project Logo"
          onChange={e => {
            setImages(e);
          }}
          imgExtension={['.jpg', '.gif', '.png']}
          maxFileSize={5242880}
          withPreview={true}
          // fileContainerStyle={{ boxShadow: 0 }}
        /> */}
        <Typography variant="caption" display="block">
          Logo
        </Typography>
        <input type="file" onChange={previewFile} />
        <img
          id="logoImg"
          src=""
          className={image ? classes.image : classes.hiddenImage}
          height="200"
          alt="Uploaded logo"
        />

        <Typography variant="body1" style={{ marginTop: 16 }}>
          In order to submit a proposol you need to stake {STAKING_AMOUNT} DAI.
        </Typography>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            // type="submit"
            disabled={web3Connect.daiAllowance > 0} // TODO: update to 50Dai
            onClick={async () => {
              let execute = async () => {
                setStatus('APPROVING_DAI');
                await web3Connect.contracts.dai.methods.triggerDaiApprove(
                  new BN(STAKING_AMOUNT)
                );
                setStatus('DAI_APPROVED');
              };
              execute();
            }}
          >
            1. Allow 50 DAI
          </Button>
          {status === 'APPROVING_DAI' && (
            <Typography
              variant="body1"
              component="span"
              className={classes.statusMsg}
            >
              Allowing transferring of 50 DAI...
            </Typography>
          )}
          {(status === 'DAI_APPROVED' || web3Connect.daiAllowance > 0) && (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
            >
              Allowance of 50 DAI complete!
            </Typography>
          )}
        </div>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            type="submit"
            disabled={
              (status !== 'DRAFT' && status !== 'DAI_APPROVED') ||
              web3Connect.daiAllowance === 0 ||
              web3Connect.daiBalance < STAKING_AMOUNT
            }
          >
            2. Submit Proposal
          </Button>
          {web3Connect.daiBalance < STAKING_AMOUNT && (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
              style={{ color: '#FF9494' }}
            >
              You don't have enough DAI on your wallet
            </Typography>
          )}
          {status === 'IPFS_UPLOAD' && (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
            >
              Uploading proposal to IPFS...
            </Typography>
          )}
          {status === 'SUBMITTING_BLOCKCHAIN' && (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
            >
              Submitting proposal to the DAO...
            </Typography>
          )}
          {status === 'SUBMITTED' && (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
            >
              Proposal submitted to the DAO successfully!
            </Typography>
          )}
        </div>
        {status === 'SUBMITTED' && (
          <div
            className={classes.divContainer}
            style={{
              marginTop: 24,
              marginBottom: 24,
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
              Vote{' '}
            </Button>
          </div>
        )}
        {/* </Box> */}
      </form>
    </Page>
  );
};

SubmitProposal.propTypes = {
  className: PropTypes.string,
};

export default SubmitProposal;
