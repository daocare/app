import { FETCH_PROPOSALS } from '../actionTypes';

const initialState = {
  loading: false,
  proposals: [],
  currentProposal: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROPOSALS: {
      const { proposals } = action.payload;
      return {
        ...state,
        proposals: proposals,
      };
    }
    default:
      return state;
  }
}
