import { gql } from 'apollo-boost';
import { client } from './Apollo';
import { useDispatch } from 'react-redux';
import {
  setDaiDeposit,
  setHasAProposal,
  setVotes,
} from '../redux/user/userActions';

const useUserData = () => {
  const dispatch = useDispatch();

  const USER_DATA_QUERY = gql`
    query Users($address: String!) {
      user(id: $address) {
        id
        amount
        timeJoinedLeft
        projects
        votes {
          id
        }
      }
    }
  `;

  const getUserData = async (address) => {
    try {
      const userData = await client.query({
        query: USER_DATA_QUERY,
        variables: { address },
      });
      const daiDeposit = userData['data']['user']['amount'];
      await dispatch(setDaiDeposit(daiDeposit / Math.pow(10, 18)));
      const projects = userData['data']['user']['projects'];
      await dispatch(setHasAProposal(projects.length > 0));
      const votes = userData['data']['user']['votes'];
      await dispatch(setVotes(votes));
    } catch {
      console.warn('User not found fetching data');
      return 0;
    }
  };

  return { getUserData };
};

export default useUserData;
