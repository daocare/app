import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import useRouter from './useRouter';
import useWeb3Connect from './useWeb3Connect';

export const useRedirectHomeIfNoEthAccount = () => {
  const router = useRouter();
  const web3Connect = useWeb3Connect();
  const connected = useSelector((state) => state.user.connected);

  useEffect(() => {
    if (web3Connect.loaded && !connected) {
      router.history.push('/');
    }
  }, [web3Connect.loaded, connected, router.history]);
};
