import { SET_DAI_APR } from '../actionTypes';

export const setDAIApr = (apr) => {
  return {
    type: SET_DAI_APR,
    payload: apr,
  };
};
