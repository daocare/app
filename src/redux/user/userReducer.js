import {
  GET_USER_DATA,
  CONNECT_USER,
  DISCONNECT_USER,
  SET_DAI_DEPOSIT,
} from '../actionTypes';

const initialState = {
  loading: false,
  connected: false,
  address: '',
  daiDeposit: null,
  daiBalance: null,
  hasAProposal: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case CONNECT_USER: {
      return {
        ...state,
        connected: true,
        address: action.payload,
      };
    }
    case DISCONNECT_USER: {
      return {
        state: initialState,
      };
    }
    case SET_DAI_DEPOSIT: {
      return {
        ...state,
        daiDeposit: action.payload,
      };
    }
    default:
      return state;
  }
}
