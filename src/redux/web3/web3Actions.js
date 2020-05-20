import { SET_PROVIDER } from '../actionTypes';

export const setProvider = (provider) => {
  console.log('provider', provider);
  return {
    type: SET_PROVIDER,
    payload: provider,
  };
};
