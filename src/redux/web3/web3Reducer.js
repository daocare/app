import { SET_PROVIDER } from '../actionTypes';

const initialState = {
  provider: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_PROVIDER: {
      return {
        ...state,
        provider: action.payload,
      };
    }
    default:
      return state;
  }
}
