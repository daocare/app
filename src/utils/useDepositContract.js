import { gql } from 'apollo-boost';
import { client } from './Apollo';

import { useSelector } from 'react-redux';

import { useState } from 'react';
import web3 from 'web3';

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';
const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';

const depositAbi = require('../abis/PoolDeposits.json');
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const useDepositContract = () => {
  const { provider } = useSelector((state) => state.web3);

  const [web3Provider] = useState(new web3(provider));

  const depositContract = new web3Provider.eth.Contract(
    depositAbi.abi,
    DEPOSIT_ADDRESS
  );

  const triggerDeposit = async (value, addr) => {
    let amount = web3.utils.toWei(value, 'ether');
    console.log('addr', addr);
    try {
      let tx = await depositContract.methods.deposit(amount).send({
        from: addr,
      });
      // await updateBalance();
      // await updateDeposit();
      console.log(tx);
      return tx;

      return tx;
    } catch (err) {
      console.warn(err);
      console.warn('Dao deposit failedddd');
      console.error('Dao deposit failed');
    }
  };

  const triggerWithdrawal = async (address) => {
    let withdrawal = depositContract.methods.withdrawDeposit().send({
      from: address,
    });
    console.log('withdrawal', withdrawal);
    return withdrawal;
  };

  const FUND_SIZE_QUERY = gql`
    {
      voteManager(id: "VOTE_MANAGER") {
        totalDeposited
      }
    }
  `;

  const getFundSize = async (address) => {
    try {
      const result = await client.query({
        query: FUND_SIZE_QUERY,
      });
      return Number(
        web3.utils.fromWei(
          '' + result['data']['voteManager']['totalDeposited'],
          'ether'
        )
      );
    } catch {
      console.warn('Fund not found');
      return 0;
    }
  };

  return { getFundSize, triggerDeposit, triggerWithdrawal };
};

export default useDepositContract;
