import { FETCH_PROPOSALS, CONNECT_USER, DISCONNECT_USER } from './actionTypes';

export const fetchProposals = (proposals) => {
  return {
    type: FETCH_PROPOSALS,
    payload: { proposals },
  };
};

//TODO: move proposals logic here

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
