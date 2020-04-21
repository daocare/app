import {
  GET_INTEREST_PREV,
  GET_INTEREST_NEXT,
  GET_FUND_SIZE,
} from '../actionTypes';

export const getInterestPrev = (prevInterest) => {
  return {
    type: GET_INTEREST_PREV,
    payload: prevInterest,
  };
};

export const getInterestNext = (nextInterest) => {
  return {
    type: GET_INTEREST_NEXT,
    payload: nextInterest,
  };
};

export const getFundSize = (fundSize) => {
  return {
    type: GET_FUND_SIZE,
    payload: fundSize,
  };
};
