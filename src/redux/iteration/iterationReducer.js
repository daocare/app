import {
  SET_ITERATION,
  SET_LAST_WINNER,
  SET_ITERATION_DEADLINE,
} from '../actionTypes';

const initialState = {
  currentIteration: null,
  lastWinner: null,
  currentIterationDeadline: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_ITERATION: {
      return {
        ...state,
        currentIteration: action.payload,
      };
    }
    case SET_LAST_WINNER: {
      return {
        ...state,
        lastWinner: action.payload,
      };
    }
    case SET_ITERATION_DEADLINE: {
      return {
        ...state,
        currentIterationDeadline: action.payload,
      };
    }
    default:
      return state;
  }
}
