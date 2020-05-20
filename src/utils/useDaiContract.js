import { useState } from 'react';
import web3 from 'web3';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';

const depositAbi = require('../abis/PoolDeposits.json');
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const daiAbi = require('../abis/ERC20.json');
const DAI_ADDRESS = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'; // KOVAN

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const INFURA_ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY; //TODO use .env to distinguish between kovan and mainnet

const useDaiContract = () => {
  const [web3Infura] = useState(new web3(INFURA_ENDPOINT));

  const daiContract = new web3Infura.eth.Contract(daiAbi.abi, DAI_ADDRESS);

  const getUserDaiBalance = async (address) => {
    try {
      let balance = new web3Infura.utils.BN(
        await daiContract.methods.balanceOf(address).call()
      );
      return Number(web3.utils.fromWei('' + balance, 'ether'));
    } catch {
      console.warn("Couldn't find this users dai balance");
      return 0;
    }
  };

  const triggerDaiApprove = async (maximumAmountApproval, address) => {
    let amount = web3.utils.toWei(maximumAmountApproval, 'ether');
    try {
      let tx = await daiContract.methods.approve(DEPOSIT_ADDRESS, amount).send({
        from: address,
      });
      // await updateAllowance(); TODO
      console.log(tx);
      return tx;
    } catch {
      console.warn('Dai was not approved');
    }
  };

  return { getUserDaiBalance, triggerDaiApprove };
};

export default useDaiContract;
