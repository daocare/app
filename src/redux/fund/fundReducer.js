import {
  SET_INTEREST_PREV,
  SET_INTEREST_NEXT,
  SET_FUND_SIZE,
} from '../actionTypes';

const initialState = {
  loading: false,
  interestPrev: null,
  interestNext: null,
  fundSize: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_INTEREST_PREV: {
      return {
        ...state,
        interestPrev: action.payload,
      };
    }
    case SET_INTEREST_NEXT: {
      return {
        ...state,
        interestNext: action.payload,
      };
    }
    case SET_FUND_SIZE: {
      return {
        ...state,
        fundSize: action.payload,
      };
    }
    default:
      return state;
  }
}
