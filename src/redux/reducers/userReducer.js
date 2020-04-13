import { GET_USER_DATA } from '../actionTypes';

const initialState = {
  loading: false,
  user: {
    address: '',
    daiDeposit: null,
    daiBalance: null,
    hasAProposal: null,
  },
};

export default function (state = initialState, action) {
  switch (action.type) {
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
