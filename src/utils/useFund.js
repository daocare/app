import { gql } from 'apollo-boost';
import { client } from './Apollo';
import web3 from 'web3';
import { useDispatch } from 'react-redux';
import { setInterestPrev, setInterestNext } from '../redux/fund/fundActions';

const useFund = () => {
  const dispatch = useDispatch();

  const FUND_QUERY = gql`
    {
      iterations(first: 1, orderBy: id, orderDirection: desc) {
        id
        payoutAmountForWinnerOfPreviousIteration
        fundsDistributed
        interestDistribution
      }
    }
  `;

  const getFundInfo = async () => {
    try {
      const fundData = await client.query({
        query: FUND_QUERY,
      });

      const previousInterestAwareded = Number(
        web3.utils.fromWei(
          fundData['data']['iterations'][0][
            'payoutAmountForWinnerOfPreviousIteration'
          ]
        )
      );

      await dispatch(setInterestPrev(previousInterestAwareded));
    } catch {
      console.warn('No previous fund payout found');
    }
  };

  return { getFundInfo };
};

export default useFund;
