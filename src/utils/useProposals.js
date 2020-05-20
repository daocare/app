// import { gql } from 'apollo-boost';
// import { client } from './Apollo';
import web3 from 'web3';

const useProposals = () => {
  const fetchProposals = async (address) => {
    try {
      console.warn('Proposals fetch not set up yet');
      return ['proposals not set up'];
    } catch {
      console.warn('No proposals found');
      return [];
    }
  };

  const userHasProposal = async (address) => {
    try {
      // return true || false
      return true;
    } catch {
      console.warn(
        'Something went wrong when checking if a user has a proposal'
      );
      return false;
    }
  };

  return { fetchProposals, userHasProposal };
};

export default useProposals;
