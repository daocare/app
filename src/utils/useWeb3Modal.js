import { useDispatch } from 'react-redux';

import { connectUser, disconnectUser } from '../redux/user/userActions';
import { setProvider, setNetworkInfo } from '../redux/web3/web3Actions';
import INFURA_ENDPOINT from '../utils/infura';

import useRouter from './useRouter';

import Web3Modal from 'web3modal';
import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed';

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;
const NOT_SUPPORTED_URL = '/network-not-supported';
const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_KEY,
    },
  },
  torus: {
    package: Torus,
    options: {},
  },
};

const web3Modal = new Web3Modal({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
  theme: 'dark',
});

const useWeb3Modal = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const SUPPORTED_NETWORKS = process.env.REACT_APP_SUPPORTED_NETWORKS.split(
    ','
  );

  // Todo
  const subscribeProvider = async (provider) => {
    console.log('subsciberProvider');
    provider.on('close', () => {
      console.log('disconnected from provider');
      triggerDisconnect();
    });

    provider.on('accountsChanged', async (accounts) => {
      console.log('accountsChanged');
      dispatch(connectUser(accounts[0]));
      // fetchProposals(accounts[0]);
      // update3BoxDetails(accounts[0]);
    });

    provider.on('chainChanged', async (chainId) => {
      console.log('chainChanged');
      //
      // setChainId(networkId);
      // setNetwork(getNetworkByChainId(networkId));
      // fetchProposals();
    });

    provider.on('networkChanged', async () => {
      console.log('networkChanged');

      // TODO

      // const chainId = await web3.eth.chainId();
      // console.log(chainId);

      // const networkId = await web3.eth.net.getId();
      // redirectToNotSupportedNetwork(chainId, networkId);

      // await dispatch(setNetworkInfo(networkId));

      // setChainId(chainId);
      // setNetworkId(networkId);
      // setNetwork(getNetworkByChainId(networkId));
      // fetchProposals();
    });
  };

  const triggerConnect = async () => {
    const providerInited = await web3Modal.connect();

    console.log(providerInited);

    await subscribeProvider(providerInited);
    const web3Inited = new Web3(providerInited);
    await web3Inited.eth.extend({
      methods: [
        {
          name: 'chainId',
          call: 'eth_chainId',
          outputFormatter: web3Inited.utils.hexToNumber,
        },
      ],
    });
    const accounts = await web3Inited.eth.getAccounts();
    const userAddress = accounts[0];
    const networkId = await web3Inited.eth.net.getId();
    const chainId = await web3Inited.eth.chainId();

    await dispatch(setNetworkInfo(networkId));
    await dispatch(connectUser(userAddress));
    await dispatch(setProvider(providerInited));

    redirectToNotSupportedNetwork(chainId, networkId);

    //   // instanciate contracts
    //   const daiContract = new web3Inited.eth.Contract(daiAbi.abi, DAI_ADDRESS);
    //   setDaiContract(daiContract);

    //   const daoContract = new web3Inited.eth.Contract(daoAbi.abi, DAO_ADDRESS);
    //   setDaoContract(daoContract);
    //   const depositContract = new web3Inited.eth.Contract(
    //     depositAbi.abi,
    //     DEPOSIT_ADDRESS
    //   );
    //   setDepositContract(depositContract);
    //   setProvider(providerInited);
    //   setWeb3(web3Inited);
    //   setConnected(true);
    //   dispatch(connectUser());
    //   setAddress(addressTemp);
    //   setChainId(chainIdTemp);
    //   setNetworkId(networkIdTemp);
    //   setNetwork(getNetworkByChainId(networkIdTemp));
    //   setLoaded(true);
    //   setLoadingWeb3(false);
    //   update3BoxDetails(addressTemp);

    //   // Update state
    //   updateAllowance(addressTemp, daiContractRead);
    //   updateBalance(addressTemp, daiContractRead, web3Read);
    //   updateDeposit(addressTemp, depositContractRead, web3Read);
    //   updateDelegation(addressTemp, daoContractRead);
    //   fetchProposals(addressTemp, daoContractRead);
  };

  const triggerDisconnect = async () => {
    // if (web3 && web3.currentProvider && web3.currentProvider.close) {
    // console.log(web3.currentProvider);
    // await web3.clearCachedProvider();
    // }
    web3Modal.clearCachedProvider();
    await dispatch(disconnectUser());
    await dispatch(setProvider(INFURA_ENDPOINT));
    // await web3Connect.clearCachedProvider();
    // await logout3Box();
    // await setProvider(null);
    // await setWeb3(null);
    // await setConnected(false);
    // await dispatch(disconnectUser());
    // await setAddress(null);
    // await setChainId(null);
    // await setNetworkId(null);
    // await setDaiContract(null);
  };

  const redirectToNotSupportedNetwork = (chainId, networkId) => {
    if (chainId !== SUPPORTED_CHAIN_ID) {
      if (window.location.pathname !== NOT_SUPPORTED_URL) {
        router.history.push(NOT_SUPPORTED_URL);
      }
    }
    if (
      window.location.pathname === NOT_SUPPORTED_URL &&
      networkId === SUPPORTED_CHAIN_ID
    ) {
      router.history.push('/');
    }
  };

  return { web3Modal, triggerConnect, triggerDisconnect, SUPPORTED_NETWORKS };
};

export default useWeb3Modal;
