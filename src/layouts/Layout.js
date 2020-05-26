import React, { Suspense, useEffect } from 'react';
import Web3 from 'web3';

import { useDispatch, useSelector } from 'react-redux';
import { getFundSize, getInterestPrev } from '../redux/fund/fundActions';
import {
  setDaiDeposit,
  connectUser,
  setHasAProposal,
} from '../redux/user/userActions';
import { setFundSize } from '../redux/fund/fundActions';
import { setProvider } from '../redux/web3/web3Actions';

import useInterval from '../utils/useInterval';
import useUserData from '../utils/useUserData';
import useDepositContract from '../utils/useDepositContract';

import { renderRoutes } from 'react-router-config';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/styles';
import { LinearProgress } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';

import BetaFlag from '../components/BetaFlag';
import Page from '../components/Page';
import WalletProfile from '../components/WalletProfile';
import Nav from '../components/Nav';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  pageOuterContainer: {
    position: 'relative',
    height: '80vh',
  },
  container: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    overflowY: 'auto',
    flex: '1 1 auto',
    position: 'absolute',
    height: '100vh',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    background:
      '-webkit-radial-gradient(#B1A4D4 5%, #9E8DC9 30%, #6850A8 60%);' /* Chrome 10-25, Safari 5.1-6 */,
    // eslint-disable-next-line
    background:
      'radial-gradient(#B1A4D4 10%, #9E8DC9 30%, #6850A8 90%);' /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */,
  },
}));

const Layout = (props) => {
  const dispatch = useDispatch();
  const userData = useUserData();
  const depositContract = useDepositContract();

  const { connected, address } = useSelector((state) => state.user);

  // On App Load
  useEffect(() => {
    depositContract.getFundSize().then((fundSize) => {
      dispatch(setFundSize(fundSize));
    });

    // TODO: refactor & handle non ethereum browser
    // Connect if already connected
    if (window.ethereum) {
      let web3 = new Web3(window.ethereum);
      window.web3 = web3;
      dispatch(setProvider(web3.currentProvider));
      dispatch(connectUser(web3.currentProvider.selectedAddress));
      window.ethereum.enable();
    } else if (window.web3) {
      console.log(window.web3.currentProvider);
      let web3 = new Web3(window.web3.currentProvider);
      window.web3 = web3;
      dispatch(setProvider(web3.currentProvider));
      dispatch(connectUser(web3.currentProvider.selectedAddress));
    } else {
      console.log(
        'Non-Ethereum browser detected. You should consider trying MetaMask!'
      );
    }
  }, []);

  // On connection changes
  useEffect(() => {
    if (address) {
      userData.getUserDaiDeposit(address.toLowerCase()).then((weiDeposit) => {
        let daiDeposit = weiDeposit / Math.pow(10, 18);
        dispatch(setDaiDeposit(daiDeposit));
      });
      userData.getUserProjects(address.toLowerCase()).then((projects) => {
        dispatch(setHasAProposal(projects.length > 0));
      });
    }
  }, [connected, address]);

  // TODO: bring back
  // This should execute once web3connect has loaded then iterate in the background
  // useInterval(async () => {
  //   if (web3Connect) {
  //     let interestPrev = await web3Connect.contracts.dao.methods.getInterest();
  //     dispatch(getInterestPrev(interestPrev));
  //     let totalFundSize = await web3Connect.contracts.dao.methods.getTotalDepositedAmount();
  //     dispatch(getFundSize(totalFundSize));
  //   }
  // }, 2000);

  const { route } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <main className={classes.content}>
          <BetaFlag />
          <Container maxWidth="md">
            <WalletProfile />
            <Paper elevation={0} className={classes.pageOuterContainer}>
              <Suspense fallback={<LinearProgress />}>
                {renderRoutes(route.routes)}
              </Suspense>
            </Paper>
            <Nav />
          </Container>
        </main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  route: PropTypes.object,
};

export default Layout;
