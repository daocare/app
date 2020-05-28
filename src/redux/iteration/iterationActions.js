import { SET_ITERATION, SET_LAST_WINNER } from '../actionTypes';

export const setIteration = (iteration) => {
  return {
    type: SET_ITERATION,
    payload: iteration,
  };
};

export const setLastWinner = (proposalId) => {
  return {
    type: SET_LAST_WINNER,
    payload: proposalId,
  };
};
