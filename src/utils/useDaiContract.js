import { useState } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';
import { setDaiAllowance } from '../redux/user/userActions';

const daiAbi = require('../abis/ERC20.json');
const depositAbi = require('../abis/PoolDeposits.json');

const CHAIN_ID = process.env.REACT_APP_SUPPORTED_CHAIN_ID;
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const DAI_ADDRESS = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;

const useDaiContract = () => {
  const dispatch = useDispatch();
  const provider = useSelector((state) => state.web3.provider);
  const address = useSelector((state) => state.user.address); // TODO check await
  const web3Provider = new web3(provider);

  const daiContract = new web3Provider.eth.Contract(daiAbi.abi, DAI_ADDRESS);

  const getUserDaiBalance = async () => {
    try {
      let balance = await daiContract.methods.balanceOf(address).call();
      let balanceBN = new web3Provider.utils.BN(balance);
      return Number(web3.utils.fromWei('' + balanceBN, 'ether'));
    } catch (err) {
      console.warn("Couldn't find this users dai balance", err);
      return 0;
    }
  };

  const getUserDaiAllowance = async () => {
    try {
      let allowanceAmount = await daiContract.methods
        .allowance(address, DEPOSIT_ADDRESS)
        .call();

      let allowanceAmountFromWei = Number(
        web3.utils.fromWei('' + allowanceAmount, 'ether')
      );

      dispatch(setDaiAllowance(allowanceAmountFromWei));
    } catch {
      console.warn("Couldn't find this users dai allowance");
      return 0;
    }
  };

  const triggerDaiApprove = async (value) => {
    let valueBN = new web3Provider.utils.BN(Math.max(value, 5000));
    let amount = web3.utils.toWei(valueBN, 'ether');

    let tx = await daiContract.methods.approve(DEPOSIT_ADDRESS, amount).send({
      from: address,
    });
    const allowance = await updateAllowance();
    return web3.utils.fromWei(allowance, 'ether');
  };

  const updateAllowance = async () => {
    let allowance = await daiContract.methods
      .allowance(address, DEPOSIT_ADDRESS)
      .call();
    await dispatch(setDaiAllowance(allowance));
    return allowance;
  };

  return {
    getUserDaiBalance,
    getUserDaiAllowance,
    triggerDaiApprove,
    updateAllowance,
  };
};

export default useDaiContract;
