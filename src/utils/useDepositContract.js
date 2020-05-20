import { gql } from 'apollo-boost';
import { client } from './Apollo';
import web3 from 'web3';

const useDepositContract = () => {
  const FUND_SIZE_QUERY = gql`
    {
      voteManager(id: "VOTE_MANAGER") {
        totalDeposited
      }
    }
  `;

  const getFundSize = async (address) => {
    try {
      const result = await client.query({
        query: FUND_SIZE_QUERY,
      });
      return Number(
        web3.utils.fromWei(
          '' + result['data']['voteManager']['totalDeposited'],
          'ether'
        )
      );
    } catch {
      console.warn('Fund not found');
      return 0;
    }
  };

  return { getFundSize };
};

export default useDepositContract;
