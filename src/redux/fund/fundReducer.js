import {
  SET_INTEREST_PREV,
  SET_INTEREST_NEXT,
  SET_FUND_SIZE,
  SET_NUMBER_OF_USERS,
} from '../actionTypes';

const initialState = {
  loading: false,
  interestPrev: null,
  interestNext: null,
  fundSize: null,
  numberOfMembers: null,
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
      console.log('action.payload');
      console.log(action.payload);
      return {
        ...state,
        fundSize: action.payload,
      };
    }
    case SET_NUMBER_OF_USERS: {
      return {
        ...state,
        numberOfMembers: action.payload,
      };
    }
    default:
      return state;
  }
}
