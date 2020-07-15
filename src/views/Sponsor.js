import React, { useState, useEffect } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';

import {
  setDaiBalance,
  setDaiAllowance,
  setDaiDeposit,
} from '../redux/user/userActions';
import { setFundSize } from '../redux/fund/fundActions';
import PropTypes from 'prop-types';
import Moment from 'moment';

import { makeStyles } from '@material-ui/styles';
import {
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  Tooltip,
} from '@material-ui/core';

import WithdrawIcon from '@material-ui/icons/RemoveCircle';
import InfoIcon from '@material-ui/icons/Info';

import Page from '../components/Page';
import Header from '../components/Header';
import EllipsisLoader from '../components/EllipsisLoader';

import CircularProgress from '@material-ui/core/CircularProgress';

import useRouter from '../utils/useRouter';
import useDaiContract from '../utils/useDaiContract';
import useDepositContract from '../utils/useDepositContract';
import useAave from '../utils/useAaveGraph';
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
    marginRight: 10,
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
  platinumSponsor: { color: '#000' },
  goldSponsor: { color: '#CCAA00' },
  silverSponsor: { color: '#737373' },
  bronzeSponsor: { color: '#CD7F32' },
}));

const Sponsor = () => {
  useRedirectHomeIfNoEthAccount();

  const [status, setStatus] = useState('DRAFT');

  const classes = useStyles();
  const router = useRouter();
  const dispatch = useDispatch();

  const daiContract = useDaiContract();
  const depositContract = useDepositContract();
  const aave = useAave();

  const { address, daiBalance, daiDeposit, daiAllowance } = useSelector(
    (state) => state.user
  );
  const { fundSize } = useSelector((state) => state.fund);
  const { currentIterationDeadline } = useSelector((state) => state.iteration);

  const { daiApr } = useSelector((state) => state.aave);

  const { provider } = useSelector((state) => state.web3);

  useEffect(() => {
    aave.getDaiApr();
  }, []);

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

    if (amount > daiAllowance) approveDai();

    setStatus(`DEPOSITING`);
    console.log('submitting dai');
    try {
      setTimeout(() => {
        depositContract.triggerDeposit(amount, address).then((amount) => {
          dispatch(setDaiDeposit(parseInt(amount)));
          dispatch(setFundSize(parseInt(fundSize) + parseInt(amount)));
          depositContract.getFundSize();
          setStatus('DEPOSITED');
        });
      }, 1000); // 1s pause
    } catch {
      console.warn('failed to deposit dai');
      setStatus('DAI_NOT_DEPOSITED');
    }
  };

  const [minimumWarning, setMinimumWarning] = useState(false);
  const BRONZE_TIER_MINIMUM = 5000;

  const bronzeMinimumWarning = () => {
    if (amount < BRONZE_TIER_MINIMUM) {
      setMinimumWarning(true);
    } else {
      setMinimumWarning(false);
    }
  };

  const celebrateImages = ['the-office.gif', 'ace-dancing.gif', 'harry.gif'];

  const [randomNumberImageIndex, setRandomNumberImageIndex] = useState(
    Math.floor(Math.random() * 3)
  );

  let cantApprove =
    status != 'READY' ||
    daiBalance < amount ||
    daiBalance === 0 ||
    daiBalance == null;

  let cantDeposit =
    // status != 'DAI_APPROVED' ||
    status === 'DEPOSITING' ||
    daiAllowance <= 0 ||
    daiBalance < amount ||
    daiBalance === 0 ||
    daiBalance == null;

  useEffect(() => {
    cantDeposit =
      status === 'DEPOSITING' ||
      daiAllowance <= 0 ||
      daiBalance < amount ||
      daiBalance === 0 ||
      daiBalance == null;
  }, [daiAllowance]);

  let isDepositing = status === 'DEPOSITING';
  return (
    <Page className={classes.root} title="dao.care | Deposit">
      <Header />

      {/* {web3Connect.hasProposal ? ( */}
      {false ? (
        <Typography style={{ color: '#FF9494' }}>
          As an owner of a proposal, you are unable to sponsor dai from the same
          address as your proposal.
        </Typography>
      ) : daiDeposit > 0 && !(status === 'DEPOSITED') ? (
        <>
          <Typography variant="body1">
            You currently have {daiDeposit} DAI deposited in the fund. If you
            would like to add to your deposit we require that you first withdraw
            your current deposit. We do this to afford maximum smart contract
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
              Sponsored DAI is for institutions and individuals that want to add
              larger amounts to the fund, remember it is Zero Cost, Sponsored
              DAI can be withdrawn at any time. The 6 largest sponsors are
              displayed on the home page and additional sponsers are listed on
              the <a href="/sponsors">sponsors page</a>.
            </Typography>
            <Typography variant="body1" className={classes.decriptionBlurb}>
              Sponsors are listed in 4 tiers.
              {/* <br />
              <span className={classes.platinumSponsor}>
                Rainbow sponsors are individuals and organizations that sponsor
                250 000 DAI or more.
              </span> */}
              <br />
              <span className={classes.platinumSponsor}>
                Platinum sponsors are individuals and organizations that sponsor
                100 000 DAI or more.
                {/* <Tooltip
                  title={` ${
                    daiApr ? Math.round((daiApr * 100000) / 12, 2) + '' : '...'
                  } 
                DAI per month Based on the current DAI apy from Aave`}
                >
                  <InfoIcon fontSize="inherit" />
                </Tooltip>
                 */}
              </span>
              <br />
              <span className={classes.goldSponsor}>
                Gold sponsors are individuals and organizations that sponsor 50
                000 DAI or more.
              </span>
              <br />
              <span className={classes.silverSponsor}>
                Silver sponsors are individuals and organizations that sponsor
                20 000 DAI or more.
              </span>
              <br />
              <span className={classes.bronzeSponsor}>
                Bronze sponsors are individuals and organizations that sponsor 5
                000 DAI or more.
              </span>
            </Typography>
            <Typography variant="body1" className={classes.decriptionBlurb}>
              Thank you for adding to the fund and letting the interest on your
              DAI support community projects 💜
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
                  onChange={() => bronzeMinimumWarning()}
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
              {minimumWarning && (
                <Typography
                  variant="body2"
                  component="span"
                  style={{ color: 'orange' }}
                >
                  Please note that in order to be displayed on the sponsors page
                  the minimum sponsor amount is 5 000 DAI to be listed in the
                  bronze tier
                </Typography>
              )}
              <div className={classes.wrapper}>
                {amount > daiAllowance && (
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => approveDai()}
                    disabled={cantApprove}
                  >
                    Approve DAI
                    {cantApprove && (
                      <CircularProgress
                        className={classes.circularProgress}
                        size={14}
                      />
                    )}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  disabled={cantDeposit}
                >
                  Deposit
                  {isDepositing && (
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
              Send us an email with your logo and public address to{' '}
              <a href="mailto:denham@avolabs.io?subject=New daocare sponsor!">
                denham@avolabs.io
              </a>{' '}
              so that we can personally thank you
              <br /> and place your image / brand on the sponsors page.
            </Typography>
          </div>
        </div>
      )}
    </Page>
  );
};

Sponsor.propTypes = {
  className: PropTypes.string,
};

export default Sponsor;
