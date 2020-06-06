import React, { useState, useEffect } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDaiBalance,
  setDaiAllowance,
  setDaiDeposit,
} from '../redux/user/userActions';
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
import WithdrawIcon from '@material-ui/icons/RemoveCircle';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';

import CircularProgress from '@material-ui/core/CircularProgress';

import useRouter from '../utils/useRouter';
import useDaiContract from '../utils/useDaiContract';
import useDepositContract from '../utils/useDepositContract';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';
import { useForm } from 'react-hook-form';

const BN = require('bn.js');

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

  const daiContract = useDaiContract();
  const depositContract = useDepositContract();

  const { address, daiBalance, daiDeposit, daiAllowance } = useSelector(
    (state) => state.user
  );

  const { currentIterationDeadline } = useSelector((state) => state.iteration);

  const { provider } = useSelector((state) => state.web3);

  useEffect(() => {
    if (address && provider) {
      if (!(daiBalance > 0)) {
        daiContract.getUserDaiBalance().then((daiBalance) => {
          dispatch(setDaiBalance(daiBalance));
        });
      }
      daiContract.getUserDaiAllowance();
      setStatus('READY');
    }
  }, [address, provider]);

  const { register, handleSubmit, watch /* , errors  */ } = useForm();
  let amount = watch('amount') ? watch('amount') : 0;

  let approveDai = async () => {
    setStatus('APPROVING_DAI');
    try {
      const bigNumberDaiBalance = new web3.utils.BN(daiBalance);
      await daiContract
        .triggerDaiApprove(bigNumberDaiBalance, address, provider)
        .then((allowance) => {
          dispatch(setDaiAllowance(allowance));
          setStatus('DAI_APPROVED');
        });
    } catch (err) {
      console.warn(err);
      console.warn('failed to approve dai');
      setStatus('DAI_NOT_APPROVED');
    }
  };

  const onSubmit = async (data) => {
    let { amount } = data;

    console.log('daiAllowance');
    console.log(daiAllowance);
    if (amount > daiAllowance) await approveDai();

    setStatus(`DEPOSITING`);
    console.log('submitting dai');
    try {
      depositContract.triggerDeposit(amount, address).then((amount) => {
        dispatch(setDaiDeposit(amount));
        depositContract.getFundSize();
        setStatus('DEPOSITED');
      });
    } catch {
      console.warn('failed to deposit dai');
      setStatus('DAI_NOT_DEPOSITED');
    }
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

  let cantDeposit =
    status != 'READY' ||
    daiBalance < amount ||
    daiBalance === 0 ||
    daiBalance == null;

  return (
    <Page className={classes.root} title="dao.care | Deposit">
      <Header />

      {/* {web3Connect.hasProposal ? ( */}
      {false ? (
        <Typography style={{ color: '#FF9494' }}>
          As an owner of a proposal, you are unable to join the pool and vote on
          proposals from the same address.
        </Typography>
      ) : daiDeposit > 0 && !(status === 'DEPOSITED') ? (
        <>
          <Typography variant="body1">
            You currently have {daiDeposit} DAI in the fund. If you would like
            to add to your deposit we require that you first withdraw your
            current deposit. We do this to afford maximum smart contract
            security.
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
        !(daiDeposit > 0) && (
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
                  helperText={`Balance: ${
                    daiBalance == null ? '...' : Math.floor(daiBalance)
                  } DAI | Deposit: ${daiDeposit} DAI`}
                />
                {(daiAllowance === 0 ||
                  status === 'DAI_APPROVED' ||
                  status === 'APPROVING_DAI') && (
                  <>
                    {status === 'APPROVING_DAI' && (
                      <Typography
                        variant="body2"
                        component="span"
                        className={classes.statusMsg}
                        style={{ marginBottom: 22 }}
                      >
                        Allowing deposits of DAI
                        <EllipsisLoader />
                      </Typography>
                    )}
                    {status === 'DAI_APPROVED' && (
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
                  disabled={cantDeposit}
                >
                  Deposit
                  {cantDeposit && (
                    <CircularProgress
                      className={classes.circularProgress}
                      size={14}
                    />
                  )}
                </Button>
                {daiBalance < amount && (
                  <Typography
                    variant="body2"
                    component="span"
                    className={classes.statusMsg}
                    style={{ color: '#FF9494' }}
                  >
                    You don't have enough DAI in your wallet to deposit {amount}{' '}
                    DAI
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
      {status === 'DEPOSITED' && daiDeposit > 0 && (
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
              To afford maximum smart contract security you can only vote on the
              next voting cycle.
              <br /> Follow us on{' '}
              <a
                href="https://twitter.com/dao_care"
                target="_blank"
                rel="noopener noreferrer"
              >
                {' '}
                twitter{' '}
                <img
                  src="/assets/socials/twitter.svg"
                  className={classes.socials}
                />
              </a>{' '}
              and join our{' '}
              <a
                href="https://t.me/daocare"
                target="_blank"
                rel="noopener noreferrer"
              >
                telegram
                <img
                  src="/assets/socials/telegram.svg"
                  className={classes.socials}
                />
              </a>{' '}
              to get notified of the next voting cycle.
            </Typography>
            <Typography
              variant="body2"
              component="span"
              style={{
                paddingTop: '20px',
                textAlign: 'center',
                display: 'block',
                margin: 'auto',
              }}
            >
              The next voting cycle will begin{' '}
              {Moment.unix(currentIterationDeadline).fromNow()}
            </Typography>
          </div>
        </div>
      )}
    </Page>
  );
};

Deposit.propTypes = {
  className: PropTypes.string,
};

export default Deposit;
