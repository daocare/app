import { CONNECT_USER, DISCONNECT_USER } from '../actionTypes';

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
