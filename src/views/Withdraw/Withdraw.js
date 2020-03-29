import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import { Page } from '../../components';
import Header from '../../components/Header';
import useRouter from '../../utils/useRouter';
import useWeb3Connect from '../../utils/useWeb3Connect';
import LoadingWeb3 from '../../components/LoadingWeb3/LoadingWeb3';
import CircularProgress from '@material-ui/core/CircularProgress';
import EllipsisLoader from '../../components/EllipsisLoader/EllipsisLoader';

const BN = require('bn.js');

const useStyles = makeStyles(theme => ({
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
}));

const Withdraw = () => {
  const [status, setStatus] = useState('DRAFT');
  const classes = useStyles();
  const router = useRouter();
  const web3Connect = useWeb3Connect();

  useEffect(() => {
    if (web3Connect.loaded && !web3Connect.connected) {
      router.history.push('/');
    }
  }, [web3Connect, router.history]);

  let balance = Number(web3Connect.daiBalance);
  let depositedFunds = Number(web3Connect.daiDeposit);

  let hasAnActiveProposal = web3Connect.hasProposal;
  let hasNoDaiInFund = web3Connect.daiDeposit <= 0;
  let hasNotApprovedDai = web3Connect.daiAllowance === 0;
  let withdrawingDisabled =
    hasAnActiveProposal || hasNoDaiInFund || hasNotApprovedDai;

  const onSubmitFunds = async () => {
    setStatus(`WITHDRAWING`);
    await web3Connect.contracts.dao.methods.triggerWithdrawal();
    setStatus('WITHDRAWN');
  };

  return (
    <Page className={classes.root} title="dao.care | Withdraw">
      {web3Connect.loadingWeb3 ? (
        <LoadingWeb3 />
      ) : (
        <>
          <Header />
          <Typography variant="body1" className={classes.decriptionBlurb}>
            Thank you for being such an awesome supporter of the community 💜.
            Please note that if you withdraw your funds you won't be able to
            vote on proposals anymore.
          </Typography>
          <Typography variant="body2" className={classes.decriptionBlurb}>
            To afford maximum contract security you can only withdraw your
            deposit in full.
          </Typography>
          <Typography variant="h5">Withdraw your DAI from the pool</Typography>
          <p> Deposited funds: {depositedFunds}</p>
          <div className={classes.wrapper}>
            <div>
              {status !== 'WITHDRAWN' && !hasAnActiveProposal && (
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={!withdrawingDisabled && (() => onSubmitFunds())}
                  disabled={withdrawingDisabled}
                >
                  Withdraw
                  {(withdrawingDisabled || status === 'WITHDRAWING') && (
                    <CircularProgress
                      className={classes.circularProgress}
                      size={14}
                    />
                  )}
                </Button>
              )}
              {status === 'WITHDRAWING' && (
                <Typography
                  variant="body2"
                  component="span"
                  className={classes.statusMsg}
                >
                  Withdrawing {depositedFunds} DAI
                  <EllipsisLoader />
                </Typography>
              )}
              {status === 'WITHDRAWN' && (
                <Typography
                  variant="body2"
                  component="span"
                  className={classes.statusMsg}
                >
                  Thank you for making an impact! Your funds have been
                  withdrawn.
                </Typography>
              )}
            </div>
          </div>
          {hasNoDaiInFund && !withdrawingDisabled && (
            <Typography variant="body2" component="span">
              It looks like you don't have any DAI deposited in the pool with
              this address
            </Typography>
          )}
          {hasAnActiveProposal && (
            <Typography variant="body2" component="span">
              It looks like you have an active proposal, in order to withdraw
              your funds you need to first withdraw your proposal
            </Typography>
          )}
        </>
      )}
    </Page>
  );
};

Withdraw.propTypes = {
  className: PropTypes.string,
};

export default Withdraw;
