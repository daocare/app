import { gql } from 'apollo-boost';
import { client } from './Apollo';
import { useQuery } from '@apollo/react-hooks';

const useUserData = () => {
  const USER_QUERY = gql`
    query Users($address: String!) {
      users(where: { id: $address }) {
        id
        amount
        timeJoined
        votes {
          id
        }
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

  const getUser = async (address) => {
    const result = await client.query({
      query: USER_QUERY,
      variables: { address },
    });
    console.log('result');
    console.log(result);
  };

  return { getUser, getProjects };
};

export default useUserData;
