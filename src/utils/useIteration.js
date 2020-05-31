import { gql } from 'apollo-boost';
import { client } from './Apollo';
import web3 from 'web3';
import { useDispatch } from 'react-redux';
import {
  setIteration,
  setLastWinner,
  setCurrentIterationDeadline,
} from '../redux/iteration/iterationActions';

const useIteration = () => {
  const dispatch = useDispatch();

  const CURRENT_ITERATION_QUERY = gql`
    {
      voteManager(id: "VOTE_MANAGER") {
        currentIteration {
          id
        }
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

  const CURRENT_ITERATION_START_TIMESTAMP_QUERY = gql`
    {
      iterations(
        first: 1
        orderBy: iterationEndTimestamp
        orderDirection: desc
      ) {
        iterationStartTimestamp
      }
    }
  `;

  const getLastWinnerId = async () => {
    try {
      const winnersData = await client.query({
        query: LAST_WINNER_QUERY,
      });

      const winnerId =
        winnersData['data']['iterations'][0]['winningProposal']['id'];

      await dispatch(setLastWinner(winnerId));
    } catch {
      console.warn('No iteration found');
    }
  };

  const getCurrentIterationIncreaseTimestamp = async () => {
    try {
      const iterationStartTimestamp = await client.query({
        query: CURRENT_ITERATION_START_TIMESTAMP_QUERY,
      });

      const startTime = parseInt(
        iterationStartTimestamp['data']['iterations'][0][
          'iterationStartTimestamp'
        ]
      );

      const twoWeeksInSeconds = 60 * 60 * 24 * 14;
      const endTime = startTime + twoWeeksInSeconds; // TODO edit if 2 week iteration changes

      await dispatch(setCurrentIterationDeadline(endTime));
    } catch {
      console.warn('No iteration found');
    }
  };

  const getIteration = async () => {
    try {
      const currentIterationReq = await client.query({
        query: CURRENT_ITERATION_QUERY,
      });

      const currentIteration =
        currentIterationReq['data']['voteManager']['currentIteration']['id'];

      await dispatch(setIteration(currentIteration));
    } catch {
      console.warn('No iteration & votemanager found');
    }
  };

  return {
    getIteration,
    getLastWinnerId,
    getCurrentIterationIncreaseTimestamp,
  };
};

export default useIteration;
