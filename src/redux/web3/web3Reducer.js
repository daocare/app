import { SET_PROVIDER, SET_NETWORK_INFO } from '../actionTypes';

const initialState = {
  provider: null,
  networkInfo: {
    network: null,
    networkId: null,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_PROVIDER: {
      return {
        ...state,
        provider: action.payload,
      };
    }
    case SET_NETWORK_INFO: {
      return {
        ...state,
        neworkInfo: action.payload,
      };
    }
    default:
      return state;
  }
}
