import { gql } from 'apollo-boost';
import { client } from './Apollo';
import web3 from 'web3';
import { useDispatch } from 'react-redux';
import {
  setIteration,
  setLastWinner,
} from '../redux/iteration/iterationActions';

const useIteration = () => {
  const dispatch = useDispatch();

  const CURRENT_ITERATION_QUERY = gql`
    {
      voteManager(id: "VOTE_MANAGER") {
        currentIteration
      }
    }
  `;

  const LAST_WINNER_QUERY = gql`
    {
      iterations(
        first: 1
        orderBy: iterationEndTimestamp
        orderDirection: desc
      ) {
        winningProposal {
          id
        }
      }
    }
  `;

  const getLastWinnerId = async () => {
    try {
      const winnerId = await client.query({
        query: LAST_WINNER_QUERY,
      });

      await dispatch(setLastWinner(winnerId));
    } catch {
      console.warn('No iteration found');
    }
  };

  const getIteration = async () => {
    try {
      const currentIteration = await client.query({
        query: CURRENT_ITERATION_QUERY,
      });

      await dispatch(setIteration(currentIteration));
    } catch {
      console.warn('No iteration & votemanager found');
    }
  };

  return { getIteration, getLastWinnerId };
};

export default useIteration;
