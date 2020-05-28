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
}));

const PageContainer = (props) => {
  const dispatch = useDispatch();
  const userData = useUserData();
  const depositContract = useDepositContract();

  const { connected, address } = useSelector((state) => state.user);

  // TODO Move this to new paper component that encapsulates pages but not the WalletProfile
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
      console.log('web3.currentProvider');
      console.log(web3.currentProvider);
      console.log(web3.currentProvider.networkVersion);
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
    <Paper elevation={0} className={classes.pageOuterContainer}>
      <Suspense fallback={<LinearProgress />}>
        {renderRoutes(route.routes)}
      </Suspense>
    </Paper>
  );
};

PageContainer.propTypes = {
  route: PropTypes.object,
};

export default PageContainer;
