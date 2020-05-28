import { useState } from 'react';
import Web3 from 'web3';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';

const depositAbi = require('../abis/PoolDeposits.json');
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const INFURA_ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY; //TODO: add env var for kovan vs mainnet

const useDepositContract = () => {
  const [web3Infura] = useState(new Web3(INFURA_ENDPOINT));

  const depositContractReadOnly = new web3Infura.eth.Contract(
    depositAbi.abi,
    DEPOSIT_ADDRESS
  );

  const getFundSize = async () => {
    let depositedAmount = new web3Infura.utils.BN(
      await depositContractReadOnly.methods.totalDepositedDai().call()
    );
    let totalFundSize = Number(
      web3Infura.utils.fromWei('' + depositedAmount, 'ether')
    );
    return totalFundSize;
  };
  return { getFundSize };
};

export default useDepositContract;
