import { SET_PROPOSALS } from '../actionTypes';

export const setProposals = (proposals) => {
  return {
    type: SET_PROPOSALS,
    payload: { proposals },
  };
};

//TODO: move proposals logic here
