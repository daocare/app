import { useState, useEffect } from 'react';

// import BigNumber from './bignumber.js';
import Web3 from 'web3';
import Web3Connect from 'web3connect';

import WalletConnectProvider from '@walletconnect/web3-provider';
// import Portis from "@portis/web3";
// import Fortmatic from "fortmatic";
import Torus from '@toruslabs/torus-embed';
// import Authereum from "authereum";

import supportedChains from './chains';
import { getJson } from '../modules/pinata';
const BN = require('bn.js');

const daiAbi = require('../abis/ERC20.json');
const daoAbi = require('../abis/NoLossDao.json');

const CHAIN_ID = 42;

const ERC20_ADDRESS = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD'; // KOVAN
const WHOOP_ADDRESS = daoAbi.networks[CHAIN_ID].address;
const INFURA_KEY = '32f4c2933abd4a74a383747ccf2d7003';

const providerOptions = {
  // portis: {
  //   package: Portis, // required
  //   options: {
  //     id: "PORTIS_ID" // required
  //   }
  // },
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

const web3Connect = new Web3Connect.Core({
  // network: "mainnet", // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

function useWeb3Connect() {
  const [provider, setProvider] = useState(null);
  const [web3, setWeb3] = useState(null);

  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [network, setNetwork] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const [daiContract, setDaiContract] = useState(null);
  const [daoContract, setDaoContract] = useState(null);
  const [daiAllowance, setDaiAllowance] = useState(0);
  const [daiBalance, setDaiBalance] = useState(0);
  const [daiDeposit, setDaiDeposit] = useState(0);
  const [hasProposal, setHasProposal] = useState(false);

  const [proposals, setProposals] = useState([]);
  const [currentVote, setCurrentVote] = useState(null);
  const [fetched, setFetched] = useState(false);

  const getNetworkByChainId = chainIdTemp => {
    // console.log(supportedChains);
    let networkTemp = supportedChains.filter(
      chain => chain.chain_id === chainIdTemp
    );
    return networkTemp && networkTemp.length > 0
      ? networkTemp[0].network
      : null;
  };

  const onConnect = async () => {
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
    console.log({ addressTemp });

    // instanciate contracts
    const daiContract = new web3Inited.eth.Contract(daiAbi.abi, ERC20_ADDRESS);
    setDaiContract(daiContract);

    const daoContract = new web3Inited.eth.Contract(daoAbi.abi, WHOOP_ADDRESS);
    setDaoContract(daoContract);

    setProvider(providerInited);
    setWeb3(web3Inited);
    setConnected(true);
    setAddress(addressTemp);
    setChainId(chainIdTemp);
    setNetworkId(networkIdTemp);
    setNetwork(getNetworkByChainId(networkIdTemp));
    setLoaded(true);
  };

  useEffect(() => {
    if (web3Connect.cachedProvider && !connected) {
      onConnect();
    } else {
      setLoaded(true);
    }
  });

  const resetApp = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Connect.clearCachedProvider();
    await setProvider(null);
    await setWeb3(null);
    await setConnected(false);
    await setAddress(null);
    await setChainId(null);
    await setNetworkId(null);
    await setDaiContract(null);
  };

  const subscribeProvider = async provider => {
    provider.on('close', () => resetApp());

    provider.on('accountsChanged', async accounts => {
      setAddress(accounts[0]);
    });

    provider.on('chainChanged', async chainId => {
      const networkId = await web3.eth.net.getId();
      setChainId(networkId);
      setNetwork(getNetworkByChainId(networkId));
    });

    provider.on('networkChanged', async networkId => {
      const chainId = await web3.eth.chainId();
      setChainId(chainId);
      setNetworkId(networkId);
      setNetwork(getNetworkByChainId(networkId));
    });
  };

  // SMART CONTRACT FUNCTIONS
  const updateAllowance = async () => {
    let allowance = await daiContract.methods
      .allowance(address, WHOOP_ADDRESS)
      .call();
    // console.log({ allowance });
    setDaiAllowance(Number(allowance));
  };
  const updateBalance = async () => {
    let balance = await daiContract.methods.balanceOf(address).call();
    // console.log({ balance });
    setDaiBalance(Number(web3.utils.fromWei(new BN(balance), 'ether')));
  };
  const updateDeposit = async () => {
    let deposit = await daoContract.methods.depositedDai(address).call();
    // console.log({ balance });
    setDaiDeposit(Number(web3.utils.fromWei(new BN(deposit), 'ether')));
  };
  // const updateProposalOwner = async () => {
  //   let proposalId = Number(
  //     await daoContract.methods.usersProposedProject(address).call()
  //   );
  //   console.log({ proposalId });
  //   setHasProposal(proposalId !== 0);
  // };
  useEffect(() => {
    if (daiContract && connected && address) {
      updateAllowance();
      updateBalance();
      updateDeposit();
      fetchProposals();
    }
  }, [daiContract, connected, address]);

  const triggerDaiApprove = async value => {
    let amount = web3.utils.toWei(value, 'ether');
    console.log({ amount });
    let tx = await daiContract.methods.approve(WHOOP_ADDRESS, amount).send({
      from: address,
    });
    console.log(tx);
    await updateAllowance();
  };

  const triggerSubmitProposal = async hash => {
    let tx = await daoContract.methods.createProposal(hash).send({
      from: address,
    });
    console.log(tx);
    await updateAllowance();
    await fetchProposals();
  };

  const triggerDeposit = async value => {
    let amount = web3.utils.toWei(value, 'ether');
    console.log({ amount });
    let tx = await daoContract.methods.deposit(amount).send({
      from: address,
    });
    console.log(tx);
    await updateBalance();
    await updateDeposit();
  };

  const fetchProposals = async () => {
    let iteration = Number(
      await daoContract.methods.proposalIteration().call()
    );
    console.log({ iteration });
    let tempCurrentVote = 0;
    if (connected) {
      tempCurrentVote = Number(
        await daoContract.methods
          .usersNominatedProject(iteration, address)
          .call()
      );
      console.log({ tempCurrentVote });
    }
    let numProposals = await daoContract.methods.proposalId().call();
    console.log({ numProposals });
    let tempProposals = [];
    let foundOwner = false;
    for (let i = 1; i <= numProposals; i++) {
      let hash = await daoContract.methods.proposalDetails(i).call();
      console.log({ hash });
      let proposal = await getJson(hash);
      proposal.id = i;
      console.log({ proposal });
      tempProposals.push(proposal);
      if (i === tempCurrentVote) {
        setCurrentVote(proposal);
      }

      let owner = await daoContract.methods.proposalOwner(i).call();
      proposal.owner = owner;
      if (owner === address) {
        foundOwner = true;
      }
    }
    setHasProposal(foundOwner);
    setProposals(tempProposals);
    setFetched(true);
  };

  const vote = async id => {
    let tx = await daoContract.methods.vote(id).send({
      from: address,
    });
    console.log(tx);
    await fetchProposals();
  };
  const enableTwitterVoting = async () => {
    let tx = await daoContract.methods
      .delegateVoting('0xd3Cbce59318B2E570883719c8165F9390A12BdD6')
      .send({
        from: address,
      });
    console.log(tx);
  };

  return {
    connected,
    address,
    chainId,
    networkId,
    network,

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
          triggerSubmitProposal,
          triggerDeposit,
          vote,
          enableTwitterVoting,
        },
      },
    },
    daiAllowance,
    daiBalance,
    daiDeposit,
    loaded,
    proposals,
    hasProposal,
    currentVote,
    fetched,
  };
}

export default useWeb3Connect;
