import { FETCH_PROPOSALS } from '../actionTypes';

export const fetchProposals = (proposals) => {
  return {
    type: FETCH_PROPOSALS,
    payload: { proposals },
  };
};

//TODO: move proposals logic here
