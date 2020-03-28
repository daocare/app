import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import { useForm } from 'react-hook-form';
import { Page } from '../../components';
import Header from '../../components/Header';
import useRouter from '../../utils/useRouter';
import useWeb3Connect from '../../utils/useWeb3Connect';
import LoadingWeb3 from '../../components/LoadingWeb3';
const BN = require('bn.js');

const useStyles = makeStyles(theme => ({
  root: {
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

  const { register, handleSubmit, watch /* , errors  */ } = useForm();
  let amount = watch('amount') ? watch('amount') : 0;
  let balance = Number(web3Connect.daiBalance);

  const onSubmit = async data => {
    let { amount } = data;
    setStatus(`WITHDRAWING`);
    // console.log(web3Connect.contracts.dao.methods.getTotalDepositedAmount());
    // console.log(
    //   await web3Connect.contracts.dao.methods.getTotalDepositedAmount()
    // );
    await web3Connect.contracts.dao.methods.triggerWithdrawal();
    setStatus('WITHDRAWN');
  };

  const testFunc = async () => {
    await web3Connect.contracts.dao.methods.testing();
  };

  return (
    <Page className={classes.root} title="dao.care | Withdraw">
      {web3Connect.loadingWeb3 && (
        <>
          <LoadingWeb3 />
        </>
      )}
      {!web3Connect.loadingWeb3 && (
        <>
          <Header />

          <Typography variant="body1" className={classes.decriptionBlurb}>
            Thank you for being such an awesome supporter of the community 💜.
            Please note that if you withdraw all of your funds you won't be able
            to vote on proposals anymore.
          </Typography>
          <Typography variant="h5">Withdraw DAI</Typography>
          {/* {!web3Connect.hasProposal && web3Connect.daiDeposit > 0 && ( */}
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box className={classes.fieldGroup}>
                <p>Current Available Deposit: ${web3Connect.daiDeposit} DAI</p>
                {(web3Connect.daiAllowance === 0 ||
                  status === 'DAI_APPROVED' ||
                  status === 'APPROVING_DAI') && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      // className={classes.button}
                      style={{ width: 190, marginBottom: 22 }}
                      // type="submit"
                      // disabled={
                      //   web3Connect.daiAllowance > 0 || status !== 'DRAFT'
                      // } // TODO: update to 50Dai
                      onClick={async () => {
                        let execute = async () => {
                          setStatus('APPROVING_DAI');
                          await web3Connect.contracts.dai.methods.triggerDaiApprove(
                            new BN(999999)
                          );
                          setStatus('DAI_APPROVED');
                        };
                        execute();
                      }}
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
                        Allowing withdrawal of DAI...
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
                        Withdraw of DAI enabled
                      </Typography>
                    )}
                  </>
                )}
              </Box>

              <div className={classes.wrapper}>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  type="submit"
                  disabled={
                    (status !== 'DRAFT' && status !== 'DAI_APPROVED') ||
                    web3Connect.daiAllowance === 0 ||
                    balance < amount ||
                    balance === 0
                  }
                >
                  Withdraw
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={() => testFunc()}
                >
                  Test
                </Button>
                {/* {web3Connect.depositBalance < amount && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                      style={{ color: '#FF9494' }}
                    >
                      You don't have enough DAI deposited to withdraw that
                      amount
                    </Typography>
                  )} */}
                {status === 'WITHDRAWING' && (
                  <Typography
                    variant="body2"
                    component="span"
                    className={classes.statusMsg}
                  >
                    Withdrawing {amount} DAI...
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
                  Vote
                </Button>
              </div>
              {/* </Box> */}
            </form>
          </>
          {/* )} */}
        </>
      )}
    </Page>
  );
};

Withdraw.propTypes = {
  className: PropTypes.string,
};

export default Withdraw;
