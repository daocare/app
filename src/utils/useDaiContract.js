import { useState } from 'react';
import web3 from 'web3';
import { useDispatch, useSelector } from 'react-redux';
import { setDaiAllowance } from '../redux/user/userActions';

const daiAbi = require('../abis/ERC20.json');
const depositAbi = require('../abis/PoolDeposits.json');

const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;

const DAI_ADDRESS = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'; // KOVAN TODO

const useDaiContract = () => {
  const dispatch = useDispatch();
  const { provider } = useSelector((state) => state.web3);
  const address = useSelector((state) => state.user.address); // TODO check await
  const [web3Provider] = useState(new web3(provider));

  const daiContract = new web3Provider.eth.Contract(daiAbi.abi, DAI_ADDRESS);

  const getUserDaiBalance = async (address) => {
    try {
      let balance = new web3Provider.utils.BN(
        await daiContract.methods.balanceOf(address).call()
      );
      return Number(web3.utils.fromWei('' + balance, 'ether'));
    } catch {
      console.warn("Couldn't find this users dai balance");
      return 0;
    }
  };

  const triggerDaiApprove = async (value) => {
    let amount = web3.utils.toWei(value, 'ether');

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

  return { getUserDaiBalance, triggerDaiApprove, updateAllowance };
};

export default useDaiContract;
