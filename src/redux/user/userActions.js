import {
  CONNECT_USER,
  DISCONNECT_USER,
  SET_DAI_DEPOSIT,
  SET_DAI_BALANCE,
  SET_DAI_ALLOWANCE,
  SET_HAS_A_PROPOSAL,
  SET_ENABLED_TWITTER,
  SET_VOTES,
} from '../actionTypes';

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

export const setDaiBalance = (daiBalance) => {
  return {
    type: SET_DAI_BALANCE,
    payload: daiBalance,
  };
};

export const setDaiDeposit = (daiDeposit) => {
  return {
    type: SET_DAI_DEPOSIT,
    payload: daiDeposit,
  };
};

export const setDaiAllowance = (daiAllowance) => {
  return {
    type: SET_DAI_ALLOWANCE,
    payload: daiAllowance,
  };
};

export const setHasAProposal = (hasAProposal) => {
  return {
    type: SET_HAS_A_PROPOSAL,
    payload: hasAProposal,
  };
};

export const setEnabledTwitter = (enabledTwitter) => {
  return {
    type: SET_ENABLED_TWITTER,
    payload: enabledTwitter,
  };
};

export const setVotes = (votes) => {
  return {
    type: SET_VOTES,
    payload: votes,
  };
};
