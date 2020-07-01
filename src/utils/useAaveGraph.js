import { gql } from 'apollo-boost';
import { aaveClient } from './Apollo';
import { useDispatch } from 'react-redux';
import { setDAIApr } from '../redux/aave/aaveActions';

const useAave = () => {
  const dispatch = useDispatch();

  const DAI_APR_QUERY = gql`
    {
      reserve(id: "0x6b175474e89094c44da98b954eedeac495271d0f") {
        # name
        # symbol
        liquidityRate
      }
    }
  `;

  const getDaiApr = async () => {
    try {
      const aprReq = await aaveClient.query({
        query: DAI_APR_QUERY,
      });

      const apr = parseFloat(aprReq['data']['reserve']['liquidityRate']);

      await dispatch(setDAIApr(apr));
    } catch {
      console.warn('No dai reserve liquidity rate found');
    }
  };

  return {
    getDaiApr,
  };
};

export default useAave;
