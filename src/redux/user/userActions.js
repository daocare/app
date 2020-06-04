import {
  CONNECT_USER,
  DISCONNECT_USER,
  SET_DAI_DEPOSIT,
  SET_DAI_BALANCE,
  SET_DAI_ALLOWANCE,
  SET_HAS_A_PROPOSAL,
  SET_ENABLED_TWITTER,
  SET_VOTES,
  SET_3BOX_INFO,
} from '../actionTypes';

export const connectUser = (address) => {
  console.log('Connect User');
  return {
    type: CONNECT_USER,
    payload: address,
  };
};

export const disconnectUser = () => {
  console.log('Disconnect User');
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

export const set3BoxData = (isLoggedIn, profile, verifiedAccounts) => {
  return {
    type: SET_3BOX_INFO,
    payload: { isLoggedIn, profile, verifiedAccounts },
  };
};
