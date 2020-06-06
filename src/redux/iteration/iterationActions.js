import {
  SET_ITERATION,
  SET_LAST_WINNER,
  SET_ITERATION_DEADLINE,
} from '../actionTypes';

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

export const setCurrentIterationDeadline = (iterationDeadline) => {
  return {
    type: SET_ITERATION_DEADLINE,
    payload: iterationDeadline,
  };
};
