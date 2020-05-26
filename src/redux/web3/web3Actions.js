import { SET_PROVIDER, SET_NETWORK_INFO } from '../actionTypes';
import supportedChains from '../../utils/chains';

// Helper
const getNetworkByChainId = (chainIdTemp) => {
  let networkTemp = supportedChains.filter(
    (chain) => chain.chain_id === chainIdTemp
  );
  return networkTemp && networkTemp.length > 0 ? networkTemp[0].network : null;
};

export const setProvider = (provider) => {
  return {
    type: SET_PROVIDER,
    payload: provider,
  };
};

export const setNetworkInfo = (networkId) => {
  const networkInfo = { network: getNetworkByChainId(networkId), networkId };
  return {
    type: SET_NETWORK_INFO,
    payload: networkInfo,
  };
};
