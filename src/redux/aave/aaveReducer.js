import { SET_DAI_APR } from '../actionTypes';

const initialState = {
  daiApr: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_DAI_APR: {
      return {
        ...state,
        daiApr: action.payload,
      };
    }
    default:
      return state;
  }
}
