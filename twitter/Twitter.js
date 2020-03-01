var Twitter = require('twitter');
var config = require('./config.js');
var T = new Twitter(config);
const Web3 = require('web3');

const {
  mnemonic,
  kovanProviderUrl,
} = require('../contracts/secretsManager.js');

let noLossDaoContract;
let mainAddress;

const setupWeb3 = async () => {
  const CHAIN_ID = 42;

  const noLossDaoAbi = require('../contracts/build/contracts/NoLossDao.json');

  var HDWalletProvider = require('truffle-hdwallet-provider');
  var provider = new HDWalletProvider(mnemonic, kovanProviderUrl);

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

  mainAddress = accounts[0];

  // const chainIdTemp = await web3Inited.eth.chainId();
  const WHOOP_ADDRESS = noLossDaoAbi.networks[CHAIN_ID].address;
  noLossDaoContract = new web3Inited.eth.Contract(
    noLossDaoAbi.abi,
    WHOOP_ADDRESS
  );
};
// instanciate contracts

var params = {
  q: '#ufc',
  count: 3,
  result_type: 'recent',
  lang: 'en',
};

const voteProxy = async value => {
  console.log({ value });
  console.log('the contract', noLossDaoContract);
  let tx = await noLossDaoContract.methods.doesNothing(value).send({
    from: mainAddress,
  });
  console.log({ tx });
  //await updatBalance();
};

setInterval(() => console.log("I'm still running"), 3000);
var myVar = setInterval(function() {
  // do stuff here
}, 15000);
// cancel after 5 min
setTimeout(myStopFunction, 5 * 60 * 1000);
// clears the interval
function myStopFunction() {
  clearInterval(myVar);
}

const proccessedTweets = {};

const start = async () => {
  await setupWeb3();
  // See search  example from API here
  // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  setInterval(
    () =>
      T.get('search/tweets', params, function(err, data, response) {
        // console.log({ err, data, response });
        if (!err) {
          for (let i = 0; i < data.statuses.length; i++) {
            // Check if duplicate tweet we have already processed
            // Check if the tweet is related to us

            // id so we could reply to this tweet with completed etherscan tx or error msg
            let id = { id: data.statuses[i].id_str };
            if (!!proccessedTweets[id]) {
              continue;
            }
            proccessedTweets[id] = true;
            // username to check if they are on our 3box database
            let username = data.statuses[i].user.screen_name;
            // scrape their vote from the text
            let text = data.statuses[i].text;

            if (i === 0) {
              voteProxy('20000');
            }

            console.log(text);
          }
        } else {
          console.log(err);
        }
      }),
    3000
  );
};

start();
