import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDaiBalance, setDaiAllowance } from '../redux/user/userActions';
import PropTypes from 'prop-types';
import Moment from 'moment';

import { makeStyles } from '@material-ui/styles';
import {
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
} from '@material-ui/core';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import WithdrawIcon from '@material-ui/icons/RemoveCircle';

import Page from '../components/Page';
import Header from '../components/Header';
import LoadingWeb3 from '../components/LoadingWeb3';
import EllipsisLoader from '../components/EllipsisLoader';

import useRouter from '../utils/useRouter';
import useDaiContract from '../utils/useDaiContract';
import useWeb3Connect from '../utils/useWeb3Connect';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';
import { useForm } from 'react-hook-form';

import BN from 'bn.js';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  decriptionBlurb: { margin: '16px 0' },
  textField: {
    margin: theme.spacing(1, 0),
    [theme.breakpoints.up('sm')]: {
      marginRight: theme.spacing(2),
    },
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
  statusMsg: {
    marginLeft: 16,
  },
  button: {
    width: 190,
  },
  pageCentered: {
    display: 'flex',
    flexFlow: 'column nowrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  socials: {
    filter: 'invert(70%)',
    transform: 'translate(0, 25%)',
    height: '20px',
    marginLeft: '5px',
    '&:hover': {
      opacity: '0.6',
    },
  },
}));

const Deposit = () => {
  useRedirectHomeIfNoEthAccount();

  const [status, setStatus] = useState('DRAFT');

  const classes = useStyles();
  const router = useRouter();
  const dispatch = useDispatch();

  const web3Connect = useWeb3Connect();
  const daiContract = useDaiContract();

  const { address, daiBalance } = useSelector((state) => state.user);

  // On Deposit Page Load
  useEffect(() => {
    if (!(daiBalance > 0)) {
      daiContract
        .getUserDaiBalance(address.toLowerCase())
        .then((daiBalance) => {
          dispatch(setDaiBalance(daiBalance));
        });
    }
  }, []);

  const { register, handleSubmit, watch /* , errors  */ } = useForm();
  let amount = watch('amount') ? watch('amount') : 0;

  let approveDai = async () => {
    setStatus('APPROVING_DAI');
    console.log('approve dai');
    // await web3Connect.contracts.dai.methods.triggerDaiApprove(
    //   new BN(daiBalance)
    // );
    setStatus('DAI_APPROVED');
  };

  const onSubmit = async (data) => {
    let { amount } = data;
    setStatus(`DEPOSITING`);
    console.log('submitting dai');
    // await web3Connect.contracts.dao.methods.triggerDeposit(amount);
    setStatus('DEPOSITED');
  };

  const [twitterWarning, setTwitterWarning] = useState(false);
  const TWITTER_VOTING_MINIMUM = 5;

  const twitterMinimumWarning = () => {
    if (amount < TWITTER_VOTING_MINIMUM) {
      setTwitterWarning(true);
    } else {
      setTwitterWarning(false);
    }
  };

  const celebrateImages = ['the-office.gif', 'ace-dancing.gif', 'harry.gif'];

  const [randomNumberImageIndex, setRandomNumberImageIndex] = useState(
    Math.floor(Math.random() * 3)
  );

  // TODO: Add countdown to next iteration
  // const numSecondsLeftInIteration = Math.max(
  //   0,
  //   web3Connect.currentIterationDeadline -
  //     Math.floor(new Date().getTime() / 1000)
  // );

  return (
    <Page className={classes.root} title="dao.care | Deposit">
      {/* TODO: bring back loading state, but simply as loader
      {web3Connect.loadingWeb3 ? (
        <LoadingWeb3 />
      ) : ( */}
      <>
        <Header />

        {web3Connect.hasProposal ? (
          <Typography style={{ color: '#FF9494' }}>
            As an owner of a proposal, you are unable to join the pool and vote
            on proposals from the same address.
          </Typography>
        ) : web3Connect.daiDeposit > 0 && status == 'DRAFT' ? (
          <>
            <Typography variant="body1">
              You currently have {web3Connect.daiDeposit} DAI in the fund. If
              you would like to add to your deposit we require that you first
              withdraw your current deposit. We do this to afford maximum smart
              contract security.
            </Typography>
            <div
              className={classes.divContainer}
              style={{
                marginTop: 24,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              <Button
                color="primary"
                size="large"
                className={classes.button}
                startIcon={<WithdrawIcon />}
                onClick={() => {
                  router.history.push('/withdraw');
                }}
              >
                Withdraw
              </Button>
            </div>
          </>
        ) : (
          web3Connect.daiDeposit === 0 && (
            <>
              <Typography variant="body1" className={classes.decriptionBlurb}>
                Deposit your DAI. Let your idle interest support community
                projects. The amount of DAI you stake in the fund determines the
                level of your voting power.
              </Typography>
              <Typography variant="h5">Deposit DAI</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box className={classes.fieldGroup}>
                  <TextField
                    label="Amount"
                    name="amount"
                    type="number"
                    variant="outlined"
                    inputRef={register({ required: true })}
                    className={classes.textField}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">DAI</InputAdornment>
                      ),
                    }}
                    onChange={() => twitterMinimumWarning()}
                    style={{ width: 300 }}
                    helperText={`Balance: ${web3Connect.daiBalance} DAI | Deposit: ${web3Connect.daiDeposit} DAI`}
                  />
                  {(web3Connect.daiAllowance === 0 ||
                    status === 'DAI_APPROVED' ||
                    status === 'APPROVING_DAI') && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        style={{ width: 190, marginBottom: 22 }}
                        disabled={
                          web3Connect.daiAllowance > 0 || status !== 'DRAFT'
                        }
                        onClick={async () => approveDai()}
                      >
                        Allow DAI deposit
                      </Button>
                      {status === 'APPROVING_DAI' && (
                        <Typography
                          variant="body1"
                          component="span"
                          className={classes.statusMsg}
                          style={{ marginBottom: 22 }}
                        >
                          Allowing deposits of DAI
                          <EllipsisLoader />
                        </Typography>
                      )}
                      {(status === 'DAI_APPROVED' ||
                        web3Connect.daiAllowance > 0) && (
                        <Typography
                          variant="body2"
                          component="span"
                          className={classes.statusMsg}
                          style={{ marginBottom: 22 }}
                        >
                          Deposit of DAI enabled
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
                {twitterWarning && (
                  <Typography
                    variant="body2"
                    component="span"
                    style={{ color: 'orange' }}
                  >
                    Please note that in order to vote through twitter we require
                    that you set a minimum deposit of {TWITTER_VOTING_MINIMUM}{' '}
                    DAI, this is to cover gas costs.
                  </Typography>
                )}
                <div className={classes.wrapper}>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    type="submit"
                    disabled={
                      (status !== 'DRAFT' && status !== 'DAI_APPROVED') ||
                      web3Connect.daiAllowance === 0 ||
                      daiBalance < amount ||
                      daiBalance === 0
                    }
                  >
                    Deposit
                  </Button>
                  {web3Connect.daiBalance < amount && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                      style={{ color: '#FF9494' }}
                    >
                      You don't have enough DAI in your wallet to deposit{' '}
                      {amount} DAI
                    </Typography>
                  )}
                  {status === 'DEPOSITING' && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                    >
                      Depositing {amount} DAI
                      <EllipsisLoader />
                    </Typography>
                  )}
                </div>
              </form>
            </>
          )
        )}
        {status === 'DEPOSITED' && (
          <div className={classes.pageCentered}>
            <div>
              <Typography
                variant="body1"
                component="span"
                style={{
                  textAlign: 'center',
                  display: 'block',
                  margin: 'auto',
                }}
              >
                🎉 Wohoo! Your funds have been deposited! 🎊
              </Typography>

              <img
                src={`./assets/celebrate/${celebrateImages[randomNumberImageIndex]}`}
                style={{
                  width: '340px',
                  display: 'block',
                  margin: '1rem auto',
                }}
              />

              <Typography
                variant="body2"
                component="span"
                style={{
                  textAlign: 'center',
                  display: 'block',
                  margin: 'auto',
                }}
              >
                {/* // TODO: Add countdown to next iteration */}
                {/* {Moment(numSecondsLeftInIteration).calendar()}                   */}
                {/* {Moment(web3Connect.currentIterationDeadline).fromNow()}  */}
                To afford maximum smart contract security you can only vote on
                the next voting cycle.
                <br /> Follow us on{' '}
                <a href="https://twitter.com/dao_care" target="_blank">
                  {' '}
                  twitter{' '}
                  <img
                    src="/assets/socials/twitter.svg"
                    className={classes.socials}
                  />
                </a>{' '}
                and join our{' '}
                <a href="https://t.me/daocare" target="_blank">
                  telegram
                  <img
                    src="/assets/socials/telegram.svg"
                    className={classes.socials}
                  />
                </a>{' '}
                to get notified of the next voting cycle.
              </Typography>
            </div>
          </div>
        )}
      </>
      {/* )} */}
    </Page>
  );
};

Deposit.propTypes = {
  className: PropTypes.string,
};

export default Deposit;
