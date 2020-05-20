import { useState } from 'react';
import web3 from 'web3';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';

const daoAbi = require('../abis/NoLossDao_v0.json');
const DAO_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const useDaoContract = () => {
  const { provider } = useSelector((state) => state.web3);
  const address = useSelector((state) => state.user.address);
  const [web3Provider] = useState(new web3(provider));

  const daoContract = new web3Provider.eth.Contract(daoAbi.abi, DAO_ADDRESS);

  return { boilerplate: () => console.log('boilerplate dao contract') };
};

export default useDaoContract;
