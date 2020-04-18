import {
  GET_INTEREST_PREV,
  GET_INTEREST_NEXT,
  GET_FUND_SIZE,
} from '../actionTypes';

const initialState = {
  loading: false,
  interestPrev: null,
  interestNext: null,
  fundSize: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_INTEREST_PREV: {
      return {
        ...state,
        interestPrev: action.payload,
      };
    }
    case GET_INTEREST_NEXT: {
      return {
        ...state,
        interestNext: action.payload,
      };
    }
    case GET_FUND_SIZE: {
      return {
        ...state,
        fundSize: action.payload,
      };
    }
    default:
      return state;
  }
}
