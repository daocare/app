open Globals;

type txOptions = {from: string};
type txResult;
type resultListeners = {on: (. string, string => unit) => resultListeners};
type txActions = {
  // send: txOptions => Js.Promise.t(Result.t(txResult, Js.Promise.error)),
  send: txOptions => resultListeners,
};
// type txActions = {send: txOptions => Js.Promise.t(Result(txResult))};
type noLossDaoMethods = {
  voteProxy: (. ~proposalId: string, ~usersAddress: string) => txActions,
};
type noLossDao = {methods: noLossDaoMethods};
type ethereumObject = {
  noLossDao,
  accounts: array(string),
  mainAddress: string,
};

let setupWeb3:
  (
    . ~chainId: int,
    ~mnemonic: string,
    ~providerUrl: string,
    ~daoAddress: string
  ) =>
  Js.Promise.t(ethereumObject) = [%raw
  {|
    async (chainId, mnemonic, providerUrl, daoAddress) => {
      const Web3 = require('web3');
      const noLossDaoAbi = require('../../../src/abis/NoLossDao_v0.json');
      var HDWalletProvider = require('truffle-hdwallet-provider');
      var provider = new HDWalletProvider(mnemonic, providerUrl);
      const web3Inited = new Web3(provider);
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
      const mainAddress = accounts[0];

      return (
        {
        noLossDao: (new web3Inited.eth.Contract(
        noLossDaoAbi.abi,
        daoAddress
      )),
      accounts,
      mainAddress
      });
    }
|}
];
