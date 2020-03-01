import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
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
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import ProposalCard from '../../components/ProposalCard';
const BN = require('bn.js');

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
}));

const Proposals = props => {
  const { className, ...rest } = props;
  const web3Connect = useWeb3Connect();
  const { proposals, fetched } = web3Connect;
  const classes = useStyles();
  // const router = useRouter();

  // useEffect(() => {
  //   if (web3Connect.loaded && !web3Connect.connected) {
  //     router.history.push('/');
  //   }
  // }, [web3Connect]);

  return (
    <Page className={classes.root} title="Whoop Together | All Proposals">
      <Header />
      {web3Connect.currentVote !== null && (
        <>
          <Typography variant="h5" className={classes.title}>
            Your vote
          </Typography>
          <div style={{ marginTop: 16, marginBottom: 16 }}>
            <ProposalCard
              proposal={web3Connect.currentVote}
              votingAllowed={false}
            />
          </div>
        </>
      )}

      <Typography variant="h5" className={classes.title}>
        All Proposals
      </Typography>
      <div style={{ marginTop: 16 }}>
        {fetched && (
          <>
            <Grid container justify="space-evenly" spacing={4}>
              {proposals.map(proposal => (
                <Grid key={proposal.id} item>
                  <div className={classes.card}>
                    <ProposalCard
                      proposal={proposal}
                      votingAllowed={web3Connect.currentVote === null}
                    />
                  </div>
                </Grid>
              ))}
            </Grid>
          </>
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
