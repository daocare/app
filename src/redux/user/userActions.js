import { CONNECT_USER, DISCONNECT_USER } from '../actionTypes';

export const connectUser = () => {
  return {
    type: CONNECT_USER,
  };
};

export const disconnectUser = () => {
  return {
    type: DISCONNECT_USER,
  };
};
