import { GET_USER_DATA, CONNECT_USER, DISCONNECT_USER } from '../actionTypes';

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
    case GET_USER_DATA: {
      const { address, daiDeposit, daiBalance, hasAProposal } = action.payload;
      return {
        ...state,
        address: address,
        daiDeposit: daiDeposit,
        daiBalance: daiBalance,
        hasAProposal: hasAProposal,
      };
    }
    default:
      return state;
  }
}
