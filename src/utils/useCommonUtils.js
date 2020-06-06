import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import useRouter from './useRouter';

export const useRedirectHomeIfNoEthAccount = () => {
  const router = useRouter();
  const connected = useSelector((state) => state.user.connected);

  useEffect(() => {
    if (connected == false) {
      router.history.push('/');
    }
  }, [connected, router.history]);
};
