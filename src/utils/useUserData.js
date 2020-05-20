import { gql } from 'apollo-boost';
import { client } from './Apollo';
// import { useQuery } from '@apollo/react-hooks';

const useUserData = () => {
  const USER_QUERY = gql`
    query Users($address: String!) {
      user(id: $address) {
        id
        amount
        timeJoined
        votes {
          id
        }
      }
    }
  `;

  const USER_DAI_DEPOSIT_QUERY = gql`
    query Users($address: String!) {
      user(id: $address) {
        amount
      }
    }
  `;

  const getProjects = async () => {
    const result = await client.query({
      query: gql`
        {
          projects() {
            id
            benefactor
            projectDataIdentifier
            projectState
          }
        }
      `,
    });
    console.log('projects');
    console.log(result);
  };

  const getUserDaiDeposit = async (address) => {
    try {
      const result = await client.query({
        query: USER_DAI_DEPOSIT_QUERY,
        variables: { address },
      });
      return result['data']['user']['amount'];
    } catch {
      console.warn('User not found');
      return 0;
    }
  };

  return { getUserDaiDeposit, getProjects };
};

export default useUserData;
