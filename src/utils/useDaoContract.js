import { useState } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';

import { setEnabledTwitter } from '../redux/user/userActions';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';
const TWITTER_PROXY_ADDRESS = process.env.REACT_APP_TWITTER_PROXY_ADDRESS;

const daoAbi = require('../abis/NoLossDao_v0.json');
const DAO_ADDRESS = daoAbi.networks[CHAIN_ID].address;

const useDaoContract = () => {
  const { provider } = useSelector((state) => state.web3);
  const address = useSelector((state) => state.user.address);
  const [web3Provider] = useState(new web3(provider));
  const dispatch = useDispatch();

  const daoContract = new web3Provider.eth.Contract(daoAbi.abi, DAO_ADDRESS);

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
    let tx = await daoContract.methods.voteDirect(id).send({
      from: address,
    });
    // await fetchProposals(); // TODO
    return tx;
  };

  return {
    enableTwitterVoting,
    vote,
  };
};

export default useDaoContract;