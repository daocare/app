var Twitter = require('twitter');
var config = require('./config.js');
var T = new Twitter(config);
const Web3 = require('web3');
const Box = require('3box');
// const moment = require('moment');

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
  q: '#WhoopTogether',
  count: 3,
  result_type: 'recent',
  lang: 'en',
};

const voteProxy = async (proposalId, usersAddress) => {
  console.log('vote params', { proposalId, usersAddress });
  let tx = await noLossDaoContract.methods
    .voteProxy(proposalId, usersAddress)
    .send({
      from: mainAddress,
    });
  console.log({ tx });
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

  console.log({ mainAddress });
  // See search  example from API here
  // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  setInterval(() => {
    console.log('looking for tweets again');
    T.get('search/tweets', params, async function(err, data, response) {
      // console.log({ value: data.statuses });
      if (!err) {
        for (let i = 0; i < data.statuses.length; i++) {
          console.log(data.statuses[i].text);

          // Check if duplicate tweet we have already processed
          // Check if the tweet is related to us

          // id so we could reply to this tweet with completed etherscan tx or error msg
          let id = { id: data.statuses[i].id_str };
          if (!!proccessedTweets[id]) {
            continue;
          }
          proccessedTweets[id] = true;

          let utcString = data.statuses[i].created_at;
          var system_date = new Date(Date.parse(utcString));
          var user_date = new Date();
          var diff = Math.floor((user_date - system_date) / 1000);
          console.log('time passed', diff);

          if (diff > 120) {
            continue;
          }

          // username to check if they are on our 3box database
          let username = data.statuses[i].user.screen_name;
          // scrape their vote from the text
          let text = data.statuses[i].text;

          console.log({ text });

          const regexEthAddrs = /(0x[a-fA-F0-9]{40})/g;
          const foundEthAddrs = text.match(regexEthAddrs);

          const regexProposalId = /~(\d+)/g;
          const foundProposalId = text.match(regexProposalId);
          console.log(foundEthAddrs);
          console.log(foundProposalId);

          if (
            !!foundEthAddrs &&
            foundEthAddrs.length > 0 &&
            !!foundProposalId &&
            foundProposalId.length > 0
          ) {
            const userEthAddress = foundEthAddrs[0];
            const proposalId = foundProposalId[0].substring(1);
            console.log('found values', userEthAddress, proposalId);

            const profile = await Box.getProfile(userEthAddress);
            const verifiedAccounts = await Box.getVerifiedAccounts(profile);

            console.log({ verifiedAccounts });
            if (i === 0) {
              voteProxy(proposalId, userEthAddress);
            }
          } else {
            console.log('invalid tweet format');
          }

          console.log(text);
        }
      } else {
        console.log(err);
      }
    });
  }, 3000);
};

start();
