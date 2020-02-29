import React, { useState } from 'react';
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
    marginBottom: theme.spacing(2),
  },
  textField: {
    margin: theme.spacing(2, 0),
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
      marginTop: theme.spacing(2),
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
  },
}));

const SubmitProposal = props => {
  const { className, ...rest } = props;
  const [status, setStatus] = useState('DRAFT');
  const classes = useStyles();
  const router = useRouter();

  const { register, handleSubmit /* , watch */ /* , errors  */ } = useForm();

  const onSubmit = async data => {
    const { title, description } = data;
    console.log(data);
    let hash = await uploadJson(data.title, data);
    console.log({ hash });
    let json = await getJson(hash);
    console.log({ json });
    // router.history.push({
    //   pathname: '/padelee/register',
    //   state: data,
    // });
    // firebase.analytics().logEvent('padelee_temp_registration', { ...data });
  };

  return (
    <Page className={classes.root} title="ETHLondon DAO">
      <Typography gutterBottom variant="h4" style={{ marginTop: 16 }}>
        Whoop Together
      </Typography>{' '}
      <Typography variant="h4" component="h2" className={classes.title}>
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
          type="email"
          inputRef={register}
          className={clsx(classes.flexGrow, classes.textField)}
          multiline
          rows={5}
        />
        <div className={classes.wrapper}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            type="submit"
          >
            Submit
          </Button>
          {status === 'sending' && (
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
