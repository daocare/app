import { SET_ITERATION, SET_LAST_WINNER } from '../actionTypes';

const initialState = {
  currentIteration: null,
  lastWinner: null,
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
    default:
      return state;
  }
}
