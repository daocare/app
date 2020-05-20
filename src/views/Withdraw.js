import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Page from '../components/Page';
import Header from '../components/Header';
import useRouter from '../utils/useRouter';
import useWeb3Connect from '../utils/useWeb3Connect';
import useDaiContract from '../utils/useDaiContract';
import useDepositContract from '../utils/useDepositContract';
import LoadingWeb3 from '../components/LoadingWeb3';
import CircularProgress from '@material-ui/core/CircularProgress';
import { LinearProgress } from '@material-ui/core';
import EllipsisLoader from '../components/EllipsisLoader';
import { useRedirectHomeIfNoEthAccount } from '../utils/useCommonUtils';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  decriptionBlurb: { margin: '16px 0' },
  fieldGroup: {
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
      marginTop: theme.spacing(1),
    },
    alignItems: 'center',
  },
  wrapper: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    [theme.breakpoints.up('md')]: {
      minHeight: '24vh',
    },
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center',
      marginTop: theme.spacing(2),
    },
  },
  statusMsg: {
    marginLeft: theme.spacing(2),
  },
  button: {
    margin: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    width: 190,
    margin: 'auto',
    display: 'block',
  },
  circularProgress: {
    marginLeft: theme.spacing.unit,
  },
  buttonContainer: {
    display: 'block',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
}));

const Withdraw = () => {
  useRedirectHomeIfNoEthAccount();

  const [status, setStatus] = useState('DRAFT');
  const classes = useStyles();
  const router = useRouter();
  const daiContract = useDaiContract();
  const depositContract = useDepositContract();
  const web3Connect = useWeb3Connect();

  const { address, daiDeposit, daiAllowance } = useSelector(
    (state) => state.user
  );

  let depositedFunds = Number(daiDeposit);

  // const { hasProposal } = useSelector((state) => state.user);

  let proposalLoading = web3Connect.hasProposal === null;
  let hasAnActiveProposal =
    web3Connect.hasProposal === true && !proposalLoading;
  let hasNoDaiInFund = daiDeposit <= 0;
  let hasNotApprovedDai = daiAllowance === 0;
  let withdrawingDisabled =
    hasAnActiveProposal ||
    hasNoDaiInFund ||
    hasNotApprovedDai ||
    !web3Connect.fetched;

  const onWithdrawFunds = async () => {
    setStatus(`WITHDRAWING`);
    try {
      depositContract.triggerWithdrawal(address).then(() => {
        setStatus('WITHDRAWN');
      });
    } catch (err) {
      console.warn(err);
    }
    // await web3Connect.contracts.dao.methods.triggerWithdrawal();
  };

  return (
    <Page className={classes.root} title="dao.care | Withdraw">
      <Header />
      <Typography variant="body1" className={classes.decriptionBlurb}>
        Thank you for being such an awesome supporter of the community 💜.
        Please note that if you withdraw your funds you won't be able to vote on
        proposals anymore.
      </Typography>
      <Typography variant="body2" className={classes.decriptionBlurb}>
        To afford maximum contract security you can only withdraw your deposit
        in full.
      </Typography>
      <Typography variant="h5">Withdraw your DAI from the pool</Typography>
      <Typography variant="body2">Deposited funds: {depositedFunds}</Typography>

      <div className={classes.wrapper}>
        <div>
          {status === 'WITHDRAWN' ? (
            <>
              <Typography
                variant="body2"
                component="span"
                className={classes.statusMsg}
              >
                Thank you for making an impact! Your funds have been withdrawn.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                className={classes.button}
                onClick={() => {
                  router.history.push('/deposit');
                }}
              >
                Deposit
              </Button>
            </>
          ) : status === 'WITHDRAWING' ? (
            <Typography
              variant="body2"
              component="span"
              className={classes.statusMsg}
            >
              Withdrawing {depositedFunds} DAI
              <EllipsisLoader />
            </Typography>
          ) : !hasAnActiveProposal ? (
            <div className={classes.buttonContainer}>
              <Button
                variant="contained"
                color="primary"
                className={classes.button}
                // onClick={!withdrawingDisabled && (() => onWithdrawFunds())}
                onClick={() => onWithdrawFunds()}
                disabled={withdrawingDisabled}
              >
                Withdraw
                {withdrawingDisabled && (
                  <CircularProgress
                    className={classes.circularProgress}
                    size={14}
                  />
                )}
              </Button>
            </div>
          ) : (
            <Typography
              variant="body2"
              component="span"
              style={{ color: 'red' }}
            >
              It looks like you have an active proposal, in order to withdraw
              your funds you need to first withdraw your proposal
            </Typography>
          )}
        </div>
      </div>
      {daiDeposit <= 0 && (
        <Typography variant="body2" component="span" style={{ color: 'red' }}>
          It looks like you don't have any DAI deposited in the pool with this
          address
        </Typography>
      )}
    </Page>
  );
};

Withdraw.propTypes = {
  className: PropTypes.string,
};

export default Withdraw;
