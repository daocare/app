import { gql } from 'apollo-boost';
import { client } from './Apollo';
import web3 from 'web3';
import { getProposalFromThreadHash } from './3BoxManager';
import { useDispatch } from 'react-redux';
import { setProposals } from '../redux/proposals/proposalsActions';

const useProposals = () => {
  const dispatch = useDispatch();

  const USER_PROJECTS_QUERY = gql`
    {
      projects {
        id
        benefactor {
          id
        }
        projectDataIdentifier
        projectState
        projectVoteResults {
          id
        }
        iterationsWon {
          id
        }
      }
    }
  `;

  const fetchProposals = async () => {
    try {
      const onChainProposals = await client.query({
        query: USER_PROJECTS_QUERY,
      });

      const projects = onChainProposals['data']['projects'];

      const getProposalsData = async () => {
        return Promise.all(
          projects.map((onChainProposal) => {
            return getProposalFromThreadHash(
              onChainProposal['projectDataIdentifier']
            );
          })
        );
      };

      let proposals = await getProposalsData();

      proposals = proposals.map((proposal, index) => {
        proposal.id = projects[index].id;
        proposal.owner = projects[index].benefactor.id; // mapping to how it was previously handled, could be refactored
        return proposal;
      });

      await dispatch(setProposals(proposals));
    } catch {
      console.warn('No proposals found');
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
