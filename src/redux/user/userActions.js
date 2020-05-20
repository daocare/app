import { CONNECT_USER, DISCONNECT_USER, SET_DAI_DEPOSIT } from '../actionTypes';

export const connectUser = (address) => {
  return {
    type: CONNECT_USER,
    payload: address,
  };
};

export const disconnectUser = () => {
  return {
    type: DISCONNECT_USER,
  };
};

export const setDaiDeposit = (daiDeposit) => {
  return {
    type: SET_DAI_DEPOSIT,
    payload: daiDeposit,
  };
};
