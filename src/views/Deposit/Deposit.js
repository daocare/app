import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Typography, Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { useForm } from 'react-hook-form';
import useRouter from '../../utils/useRouter';
import { Page } from '../../components';
import Header from '../../components/Header';
import useWeb3Connect from '../../utils/useWeb3Connect';
import InputAdornment from '@material-ui/core/InputAdornment';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import LoadingWeb3 from '../../components/LoadingWeb3';
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
}));

const Deposit = () => {
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
  // let deposit = Number(web3Connect.daiDeposit);
  // console.log({ allowance: web3Connect.daiBalance, amount });
  const onSubmit = async data => {
    let { amount } = data;

    setStatus(`DEPOSITING`);
    // const { title, description } = data;
    console.log(data);

    // let body = { ...data, image };

    // let hash = await uploadJson(data.title, body);
    // setStatus('SUBMITTING_BLOCKCHAIN');

    // // console.log({ hash });
    // // let json = await getJson(hash);
    // // console.log({ json });
    await web3Connect.contracts.dao.methods.triggerDeposit(amount);

    setStatus('DEPOSITED');
  };

  return (
    <Page className={classes.root} title="dao.care | Deposit">
      <Header />
      <Typography variant="h5" className={classes.title}>
        Deposit DAI
      </Typography>
      {web3Connect.hasProposal && (
        <>
          <Typography style={{ color: '#FF9494' }}>
            As an owner of a proposal, you are not allowed to join the pool and
            vote on proposals.
          </Typography>
        </>
      )}
      {web3Connect.loadingWeb3 && (
        <>
          <LoadingWeb3 />
        </>
      )}
      {!web3Connect.loadingWeb3 && (
        <>
          {!web3Connect.hasProposal && web3Connect.daiDeposit > 0 && (
            <>
              {/* <Typography style={{ color: '#FF9494' }}>
            You can only deposit once per each cycle.
          </Typography> */}
              <Typography variant="body1">
                Current deposit: {web3Connect.daiDeposit} DAI
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
            </>
          )}
          {!web3Connect.hasProposal && web3Connect.daiDeposit === 0 && (
            <>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box className={classes.fieldGroup}>
                  <TextField
                    // fullWidth
                    label="Amount"
                    name="amount"
                    variant="outlined"
                    inputRef={register({ required: true })}
                    className={classes.textField}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">DAI</InputAdornment>
                      ),
                    }}
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
                        // className={classes.button}
                        style={{ width: 190, marginBottom: 22 }}
                        // type="submit"
                        disabled={
                          web3Connect.daiAllowance > 0 || status !== 'DRAFT'
                        } // TODO: update to 50Dai
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
                          Allowing deposits of DAI...
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
                {/* <Typography variant="body1" style={{ marginTop: 16 }}>
          In order to submit a proposol you need to stake {STAKING_AMOUNT} DAI.
        </Typography> */}

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
                    Deposit
                  </Button>
                  {web3Connect.daiBalance < amount && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                      style={{ color: '#FF9494' }}
                    >
                      You don't have enough DAI on your wallet
                    </Typography>
                  )}
                  {status === 'DEPOSITING' && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                    >
                      Depositing {amount} DAI...
                    </Typography>
                  )}
                  {status === 'DEPOSITED' && (
                    <Typography
                      variant="body2"
                      component="span"
                      className={classes.statusMsg}
                    >
                      Your funds have been deposited, thank you!
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
          )}
        </>
      )}
    </Page>
  );
};

Deposit.propTypes = {
  className: PropTypes.string,
};

export default Deposit;
