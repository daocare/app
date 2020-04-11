import { useState, useEffect } from 'react';
import Web3 from 'web3';
import Web3Connect from 'web3connect';

import WalletConnectProvider from '@walletconnect/web3-provider';
// import Portis from "@portis/web3";
// import Fortmatic from "fortmatic";
import Torus from '@toruslabs/torus-embed';
// import Authereum from "authereum";

import supportedChains from './chains';
import useInterval from '../utils/useInterval';
import useRouter from './useRouter';

import {
  open3Box,
  get3BoxProfile,
  isFetching,
  logout3Box,
  isLoggedIn,
  getThreadFirstPost,
} from './3BoxManager';

const daiAbi = require('../abis/ERC20.json');
const daoAbi = require('../abis/NoLossDao_v0.json');
const depositAbi = require('../abis/PoolDeposits.json');

const SUPPORTED_CHAIN_ID = Number(process.env.REACT_APP_SUPPORTED_CHAIN_ID);
const SUPPORTED_NETWORK = 'kovan';

const CHAIN_ID = process.env.REACT_APP_DEFAULT_CHAIN_ID || '42';
const DAI_ADDRESS = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'; // KOVAN
const ADAI_ADDRESS = '0x58ad4cb396411b691a9aab6f74545b2c5217fe6a'; //kovan
const DAO_ADDRESS = daoAbi.networks[CHAIN_ID].address;
const DEPOSIT_ADDRESS = depositAbi.networks[CHAIN_ID].address;
const INFURA_KEY = 'fd2fcca3c26e41cf88b907df3596b14e';
const INFURA_ENDPOINT = 'https://kovan.infura.io/v3/' + INFURA_KEY;

const NOT_SUPPORTED_URL = '/network-not-supported';

const TWITTER_PROXY = '0xd3Cbce59318B2E570883719c8165F9390A12BdD6';
let FETCH_UPDATE_INTERVAL = 7000;
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: INFURA_KEY,
    },
  },
  // portis: {
  //   package: Portis,
  //   options: {
  //     id: process.env.REACT_APP_PORTIS_ID
  //   }
  // },
  // fortmatic: {
  //   package: Fortmatic,
  //   options: {
  //     key: process.env.REACT_APP_FORTMATIC_KEY
  //   }
  // },
  torus: {
    package: Torus,
    options: {},
  },
  // authereum: {
  //   package: Authereum,
  //   options: {}
  // }
};
let isFetchingProposals = false;

const web3Connect = new Web3Connect.Core({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

function useWeb3Connect() {
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [web3ReadOnly, setWeb3ReadOnly] = useState(null);

  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [loadingWeb3, setLoadingWeb3] = useState(false);

  const router = useRouter();

  const [daiContract, setDaiContract] = useState(null);
  const [daiContractReadOnly, setDaiContractReadOnly] = useState(null);
  // const [adaiContract, setAdaiContract] = useState(null);
  const [adaiContractReadOnly, setAdaiContractReadOnly] = useState(null);
  const [daoContract, setDaoContract] = useState(null);
  const [depositContract, setDepositContract] = useState(null);
  const [daoContractReadOnly, setDaoContractReadOnly] = useState(null);
  const [depositContractReadOnly, setDepositContractReadOnly] = useState(null);
  const [daiAllowance, setDaiAllowance] = useState(null);
  const [daiBalance, setDaiBalance] = useState(null);
  const [daiDeposit, setDaiDeposit] = useState(null);
  const [hasProposal, setHasProposal] = useState(null);
  const [enabledTwitter, setEnabledTwitter] = useState(false);

  const [currentIteration, setCurrentIteration] = useState(0);
  const [
    topProposalInCurrentIterationId,
    setTopProposalInCurrentIterationId,
  ] = useState(0);
  const [previousWinnerId, setPreviousWinnerId] = useState(0);
  const [currentIterationDeadline, setCurrentIterationDeadline] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [currentVote, setCurrentVote] = useState(null);
  const [fetched, setFetched] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);

  const [is3BoxLoggedIn, setIs3BoxLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userVerifiedAccounts, setUserVerifiedAccounts] = useState(null);

  const getNetworkByChainId = (chainIdTemp) => {
    let networkTemp = supportedChains.filter(
      (chain) => chain.chain_id === chainIdTemp
    );
    return networkTemp && networkTemp.length > 0
      ? networkTemp[0].network
      : null;
  };

  const onConnect = async (
    daiContractRead = daiContractReadOnly,
    daoContractRead = daoContractReadOnly,
    depositContractRead = depositContractReadOnly,
    web3Read = web3ReadOnly
  ) => {
    const providerInited = await web3Connect.connect();

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

    const addressTemp = accounts[0];

    const networkIdTemp = await web3Inited.eth.net.getId();

    const chainIdTemp = await web3Inited.eth.chainId();

    if (chainIdTemp !== SUPPORTED_CHAIN_ID) {
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

    // instanciate contracts
    const daiContract = new web3Inited.eth.Contract(daiAbi.abi, DAI_ADDRESS);
    setDaiContract(daiContract);

    const daoContract = new web3Inited.eth.Contract(daoAbi.abi, DAO_ADDRESS);
    setDaoContract(daoContract);
    const depositContract = new web3Inited.eth.Contract(
      depositAbi.abi,
      DEPOSIT_ADDRESS
    );
    setDepositContract(depositContract);
    setProvider(providerInited);
    setWeb3(web3Inited);
    setConnected(true);
    setAddress(addressTemp);
    setChainId(chainIdTemp);
    setNetworkId(networkIdTemp);
    setNetwork(getNetworkByChainId(networkIdTemp));
    setLoaded(true);
    setLoadingWeb3(false);
    update3BoxDetails(addressTemp);

    // Update state
    updateAllowance(addressTemp, daiContractRead);
    updateBalance(addressTemp, daiContractRead, web3Read);
    updateDeposit(addressTemp, depositContractRead, web3Read);
    updateDelegation(addressTemp, daoContractRead);
    fetchProposals(addressTemp, daoContractRead);
  };

  // eslint-disable-next-line
  useEffect(() => {
    if (!loaded && !loadingWeb3) {
      let web3Infura = new Web3(INFURA_ENDPOINT);
      setWeb3ReadOnly(web3Infura);

      const daiContractReadOnly = new web3Infura.eth.Contract(
        daiAbi.abi,
        DAI_ADDRESS
      );
      setDaiContractReadOnly(daiContractReadOnly);

      const adaiContractReadOnly = new web3Infura.eth.Contract(
        daiAbi.abi,
        ADAI_ADDRESS
      );
      setAdaiContractReadOnly(adaiContractReadOnly);

      const daoContractReadOnly = new web3Infura.eth.Contract(
        daoAbi.abi,
        DAO_ADDRESS
      );
      setDaoContractReadOnly(daoContractReadOnly);

      const depositContractReadOnly = new web3Infura.eth.Contract(
        depositAbi.abi,
        DEPOSIT_ADDRESS
      );
      setDepositContractReadOnly(depositContractReadOnly);

      if (web3Connect.cachedProvider && !connected) {
        setLoadingWeb3(true);
        onConnect(
          daiContractReadOnly,
          daoContractReadOnly,
          depositContractReadOnly,
          web3Infura
        );
      } else {
        setLoaded(true);
      }
    }
  });

  useInterval(async () => {
    if (daoContractReadOnly) {
      fetchProposals();
    }
    if (
      window.location.pathname === NOT_SUPPORTED_URL &&
      networkId === SUPPORTED_CHAIN_ID
    ) {
      router.history.push('/');
    }
    if (connected && address) {
      updateAllowance();
      updateBalance();
      updateDeposit();
      updateDelegation();
    }
  }, FETCH_UPDATE_INTERVAL);

  const resetApp = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Connect.clearCachedProvider();
    await logout3Box();
    await setProvider(null);
    await setWeb3(null);
    await setConnected(false);
    await setAddress(null);
    await setChainId(null);
    await setNetworkId(null);
    await setDaiContract(null);
  };

  const subscribeProvider = async (provider) => {
    provider.on('close', () => resetApp());

    provider.on('accountsChanged', async (accounts) => {
      setAddress(accounts[0]);
      fetchProposals(accounts[0]);
      update3BoxDetails(accounts[0]);
    });

    provider.on('chainChanged', async (chainId) => {
      const networkId = await web3.eth.net.getId();
      setChainId(networkId);
      setNetwork(getNetworkByChainId(networkId));
      fetchProposals();
    });

    provider.on('networkChanged', async (networkId) => {
      const chainId = await web3.eth.chainId();
      setChainId(chainId);
      setNetworkId(networkId);
      setNetwork(getNetworkByChainId(networkId));
      fetchProposals();
    });
  };

  // 3BOX Functions
  const update3BoxDetails = async (addr = address, prov = provider) => {
    if (addr) {
      const loggedIn = await isLoggedIn(addr);
      setIs3BoxLoggedIn(loggedIn);

      let { profile, verifiedAccounts } = await get3BoxProfile(addr);
      setUserProfile(profile);
      setUserVerifiedAccounts(verifiedAccounts);

      // check if user has this space, if so we can open the box in the bg
      if (loggedIn && !isFetching) {
        await open3Box(addr, prov);
      }

      return { profile, verifiedAccounts };
    }
    return { profile: null, verifiedAccounts: null };
  };
  const triggerOpen3Box = async (addr = address, prov = provider) => {
    if (addr && prov) {
      await open3Box(addr, prov);
    }
  };

  // SMART CONTRACT FUNCTIONS
  const updateAllowance = async (
    addr = address,
    daiContract = daiContractReadOnly
  ) => {
    if (addr) {
      let allowance = await daiContract.methods
        .allowance(addr, DEPOSIT_ADDRESS)
        .call();
      setDaiAllowance(Number(allowance));
    }
  };
  const updateBalance = async (
    addr = address,
    daiContract = daiContractReadOnly,
    web3Read = web3ReadOnly
  ) => {
    if (addr) {
      let balance = new web3Read.utils.BN(
        await daiContract.methods.balanceOf(addr).call()
      );
      setDaiBalance(Number(web3Read.utils.fromWei('' + balance, 'ether')));
    }
  };

  const updateDeposit = async (
    addr = address,
    depositContract = depositContractReadOnly,
    web3Read = web3ReadOnly
  ) => {
    if (addr) {
      let deposit = new web3Read.utils.BN(
        await depositContract.methods.depositedDai(addr).call()
      );
      setDaiDeposit(Number(web3Read.utils.fromWei('' + deposit, 'ether')));
    }
  };

  const updateDelegation = async (
    addr = address,
    daoContract = daoContractReadOnly
  ) => {
    if (addr) {
      let delegation = await daoContract.methods.voteDelegations(addr).call();
      setEnabledTwitter(delegation === TWITTER_PROXY);
    }
  };

  const getInterest = async () => {
    if (!adaiContractReadOnly) {
      return 0;
    }
    let balance = new web3ReadOnly.utils.BN(
      await adaiContractReadOnly.methods.balanceOf(DEPOSIT_ADDRESS).call()
    );
    let depositedAmount = new web3ReadOnly.utils.BN(
      await depositContractReadOnly.methods.totalDepositedDai().call()
    );
    let interest = balance.sub(depositedAmount);

    return Number(web3ReadOnly.utils.fromWei(interest, 'ether'));
  };

  const getTotalDepositedAmount = async () => {
    if (!adaiContractReadOnly) {
      return 0;
    }

    let depositedAmount = new web3ReadOnly.utils.BN(
      await depositContractReadOnly.methods.totalDepositedDai().call()
    );
    return Number(web3ReadOnly.utils.fromWei('' + depositedAmount, 'ether'));
  };

  const fetchProposals = async (
    addr = address,
    daoContract = daoContractReadOnly
  ) => {
    if (
      lastFetchTimestamp + FETCH_UPDATE_INTERVAL < Date.now() &&
      daoContract &&
      !isFetchingProposals
    ) {
      isFetchingProposals = true;
      let iteration = Number(
        await daoContract.methods.proposalIteration().call()
      );

      let tempCurrentVote = 0;
      if (connected && addr) {
        tempCurrentVote = Number(
          await daoContract.methods
            .usersNominatedProject(iteration, addr)
            .call()
        );
      }
      let numProposals = await daoContract.methods.proposalId().call();
      let tempProposals = [];
      let foundOwner = false;
      for (let i = 1; i <= numProposals; i++) {
        let hash = await daoContract.methods.proposalDetails(i).call();
        if (!hash.includes('orbitdb')) {
          console.log(`Skipping ${hash} as it is not stored on a thread...`);
          continue;
        }
        let proposalThreadFirstPost = await getThreadFirstPost(hash);
        if (proposalThreadFirstPost) {
          let proposal = proposalThreadFirstPost['message'];
          proposal.id = i;

          if (i === tempCurrentVote) {
            setCurrentVote(proposal);
          }

          let owner = await daoContract.methods.proposalOwner(i).call();
          proposal.owner = owner;
          if (owner === addr) {
            foundOwner = true;
          }
          tempProposals.push(proposal);
        }
      }

      let deadline = await daoContract.methods.proposalDeadline().call();

      setCurrentIteration(iteration);
      setCurrentIterationDeadline(deadline);
      setHasProposal(foundOwner);
      setProposals(tempProposals);
      setFetched(true);
      setLastFetchTimestamp(Date.now());
      isFetchingProposals = false;
      const topProposalId = Number(
        await daoContract.methods.topProject(iteration).call()
      );
      setTopProposalInCurrentIterationId(topProposalId);
      const thePreviousWinnerId = Number(
        await daoContract.methods.topProject(iteration - 1).call()
      );
      setPreviousWinnerId(thePreviousWinnerId);
    }
  };

  const triggerDaiApprove = async (value) => {
    let amount = web3.utils.toWei(value, 'ether');
    let tx = await daiContract.methods.approve(DEPOSIT_ADDRESS, amount).send({
      from: address,
    });
    await updateAllowance();
    return tx;
  };

  const triggerSubmitProposal = async (hash) => {
    let tx = await depositContract.methods.createProposal(hash).send({
      from: address,
    });
    await updateAllowance();
    await fetchProposals();
    return tx;
  };

  const triggerDeposit = async (value) => {
    let amount = web3.utils.toWei(value, 'ether');
    let tx = await depositContract.methods.deposit(amount).send({
      from: address,
    });
    await updateBalance();
    await updateDeposit();
    return tx;
  };

  const triggerWithdrawal = async () => {
    let withdrawal = depositContract.methods.withdrawDeposit().send({
      from: address,
    });
    return withdrawal;
  };

  const distributeFunds = async () => {
    let distributeFundsTx = daoContract.methods.distributeFunds().send({
      from: address,
    });
    return distributeFundsTx;
  };

  const vote = async (id) => {
    let tx = await daoContract.methods.voteDirect(id).send({
      from: address,
    });
    await fetchProposals();
    return tx;
  };

  const enableTwitterVoting = async () => {
    let tx = await daoContract.methods.delegateVoting(TWITTER_PROXY).send({
      from: address,
    });
    updateDelegation();
    return tx;
  };

  return {
    connected,
    address,
    chainId,
    networkId,
    network,
    supportedNetwork: SUPPORTED_NETWORK,
    triggerConnect: onConnect,
    web3,
    web3Connect,
    resetApp,
    provider,
    contracts: {
      dai: {
        contract: daiContract,
        methods: {
          triggerDaiApprove,
        },
      },
      dao: {
        contract: daoContract,
        methods: {
          // TODO: some of these methods need to move to the deposit contract
          triggerSubmitProposal,
          triggerDeposit,
          triggerWithdrawal,
          vote,
          enableTwitterVoting,
          getInterest,
          getTotalDepositedAmount,
          distributeFunds,
        },
      },
      deposit: {
        contract: depositContract,
        methods: {},
      },
    },
    daiAllowance,
    currentIteration,
    currentIterationDeadline,
    topProposalInCurrentIterationId,
    previousWinnerId,
    daiBalance,
    daiDeposit,
    loaded,
    loadingWeb3,
    proposals,
    hasProposal,
    enabledTwitter,
    currentVote,
    fetched,
    is3BoxLoggedIn,
    userProfile,
    userVerifiedAccounts,
    update3BoxDetails,
    triggerOpen3Box,
  };
}

export default useWeb3Connect;
