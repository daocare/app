import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useForm } from 'react-hook-form';
import useRouter from '../../utils/useRouter';
import { uploadJson, getJson } from '../../modules/pinata';
import { Page, WalletProfile } from '../../components';
import Header from '../../components/Header';
import ImageUploader from 'react-images-upload';
import useWeb3Connect from '../../utils/useWeb3Connect';
const STAKING_AMOUNT = 50;

const useStyles = makeStyles(theme => ({
  root: {
    // backgroundColor: theme.palette.white
    marginTop: theme.spacing(2),
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
}));

const SubmitProposal = props => {
  const { className, ...rest } = props;
  const [status, setStatus] = useState('DRAFT');
  const [image, setImage] = useState(false);
  const classes = useStyles();
  const router = useRouter();
  const web3Connect = useWeb3Connect();

  useEffect(() => {
    if (web3Connect.loaded && !web3Connect.connected) {
      router.history.push('/');
    }
  }, [web3Connect]);

  const { register, handleSubmit /* , watch */ /* , errors  */ } = useForm();

  const onSubmit = async data => {
    setStatus('SENDING');
    // const { title, description } = data;
    console.log(data);

    let body = { ...data, image };

    let hash = await uploadJson(data.title, body);

    console.log({ hash });
    let json = await getJson(hash);
    console.log({ json });
    setStatus('SENT');
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
  return (
    <Page className={classes.root} title="ETHLondon DAO">
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
          inputRef={register}
          className={clsx(classes.flexGrow, classes.textField)}
        />
        <TextField
          fullWidth
          label="Description"
          name="email"
          variant="outlined"
          inputRef={register}
          className={clsx(classes.flexGrow, classes.textField)}
          multiline
          rows={5}
        />
        <TextField
          fullWidth
          label="Website"
          name="website"
          variant="outlined"
          inputRef={register}
          className={clsx(classes.flexGrow, classes.textField)}
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
          alt="Image preview..."
        />

        <Typography variant="body1" style={{ marginTop: 16 }}>
          In order to submit a proposol you need to stake {STAKING_AMOUNT} DAI.
        </Typography>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            type="submit"
            disabled={status === 'SENT'}
          >
            1. Approve DAI
          </Button>
          {/* {status === 'SENDING' && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )} */}
        </div>
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            type="submit"
            disabled={status === 'SENT'}
          >
            2. Submit Proposal
          </Button>
          {status === 'SENDING' && (
            <CircularProgress size={24} className={classes.buttonProgress} />
          )}
        </div>
        {/* </Box> */}
      </form>
    </Page>
  );
};

SubmitProposal.propTypes = {
  className: PropTypes.string,
};

export default SubmitProposal;
