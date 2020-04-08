type txOptions = {from: string};
type txResult;
type txActions = {send: txOptions => Js.Promise.t(Result(txResult))};
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
      console.log({accounts})
      const mainAddress = accounts[0];
      console.log({mainAddress})

      console.log({ address: daoAddress });
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
