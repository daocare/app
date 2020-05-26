import {
  GET_USER_DATA,
  CONNECT_USER,
  DISCONNECT_USER,
  SET_DAI_DEPOSIT,
  SET_DAI_BALANCE,
  SET_DAI_ALLOWANCE,
  SET_HAS_A_PROPOSAL,
} from '../actionTypes';

const initialState = {
  loading: false,
  connected: false,
  address: '',
  daiDeposit: null,
  daiBalance: null,
  daiAllowance: null,
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
    case SET_DAI_BALANCE: {
      return {
        ...state,
        daiBalance: action.payload,
      };
    }
    case SET_DAI_DEPOSIT: {
      return {
        ...state,
        daiDeposit: action.payload,
      };
    }
    case SET_DAI_ALLOWANCE: {
      return {
        ...state,
        daiAllowance: action.payload,
      };
    }
    case SET_HAS_A_PROPOSAL: {
      return {
        ...state,
        hasAProposal: action.payload,
      };
    }
    default:
      return state;
  }
}
