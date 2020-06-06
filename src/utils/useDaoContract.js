import { useState } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';

import { setEnabledTwitter } from '../redux/user/userActions';

import useUserData from './useUserData';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';
const TWITTER_PROXY_ADDRESS = process.env.REACT_APP_TWITTER_PROXY_ADDRESS;

const daoAbi = require('../abis/NoLossDao_v0.json');
const DAO_ADDRESS = daoAbi.networks[CHAIN_ID].address;

const useDaoContract = () => {
  const { provider } = useSelector((state) => state.web3);
  const address = useSelector((state) => state.user.address);
  const web3Provider = new web3(provider);
  const dispatch = useDispatch();

  const daoContract = new web3Provider.eth.Contract(daoAbi.abi, DAO_ADDRESS);
  const userData = useUserData();

  const updateDelegation = async () => {
    if (address) {
      let delegation = await daoContract.methods
        .voteDelegations(address)
        .call();
      await dispatch(setEnabledTwitter(delegation === TWITTER_PROXY_ADDRESS));
    }
  };

  const enableTwitterVoting = async () => {
    let tx = await daoContract.methods
      .delegateVoting(TWITTER_PROXY_ADDRESS)
      .send({
        from: address,
      });
    updateDelegation();
    return tx;
  };

  const vote = async (id) => {
    try {
      let tx = await daoContract.methods.voteDirect(parseInt(id)).send({
        from: address,
      });
      // await fetchProposals(); // TODO
      userData.getUserData(address);
      return tx;
    } catch (err) {
      console.warn('Unable to vote: ', err);
    }
  };

  const distributeFunds = async () => {
    try {
      let distributeFundsTx = daoContract.methods.distributeFunds().send({
        from: address,
      });
      return distributeFundsTx;
    } catch (err) {
      console.warn('Unable to increase iteration and distribute funds: ', err);
    }
  };

  return {
    enableTwitterVoting,
    vote,
    distributeFunds,
  };
};

export default useDaoContract;
