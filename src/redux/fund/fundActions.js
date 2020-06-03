import {
  SET_INTEREST_PREV,
  SET_INTEREST_NEXT,
  SET_FUND_SIZE,
  SET_NUMBER_OF_USERS,
} from '../actionTypes';

export const setInterestPrev = (prevInterest) => {
  return {
    type: SET_INTEREST_PREV,
    payload: prevInterest,
  };
};

export const setInterestNext = (nextInterest) => {
  return {
    type: SET_INTEREST_NEXT,
    payload: nextInterest,
  };
};

export const setFundSize = (fundSize) => {
  return {
    type: SET_FUND_SIZE,
    payload: fundSize,
  };
};

export const setNumberOfMembers = (numberOfMembers) => {
  return {
    type: SET_NUMBER_OF_USERS,
    payload: numberOfMembers,
  };
};
