import { gql } from 'apollo-boost';
import { client } from './Apollo';
import { useDispatch } from 'react-redux';
import {
  setDaiDeposit,
  setHasAProposal,
  setVotes,
  setLastIterationJoinedOrLeft,
} from '../redux/user/userActions';
import { setNumberOfMembers } from '../redux/fund/fundActions';

const useUserData = () => {
  const dispatch = useDispatch();

  const USER_DATA_QUERY = gql`
    query Users($address: String!) {
      user(id: $address) {
        id
        amount
        timeJoinedLeft
        iterationJoinedLeft {
          id
        }
        projects {
          id
        }
        votes {
          id
        }
      }
    }
  `;

  const USERS_QUERY = gql`
    {
      users {
        id
        amount
      }
    }
  `;

  const getUsers = async () => {
    try {
      const userData = await client.query({
        query: USERS_QUERY,
      });
      const numberOfUsersdata = userData['data']['users'];
      const numberOfActiveUsers =
        numberOfUsersdata.length -
        numberOfUsersdata.filter((user) => parseInt(user['amount']) <= 0)
          .length;

      await dispatch(setNumberOfMembers(numberOfActiveUsers));
    } catch {
      console.warn('User not found fetching data');
      return 0;
    }
  };

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

      const lastIterationJoinedOrLeft = Math.max.apply(
        Math,
        userData['data']['user']['iterationJoinedLeft'].map(function (iter) {
          return parseInt(iter['id']);
        })
      );
      await dispatch(setLastIterationJoinedOrLeft(lastIterationJoinedOrLeft));
    } catch (err) {
      await dispatch(setDaiDeposit(0));
      await dispatch(setHasAProposal(false));
      await dispatch(setVotes([]));
      console.warn('User error when fetching data', err);
      return 0;
    }
  };

  return { getUsers, getUserData };
};

export default useUserData;
