// THIS IS ALL HACKY PROTOTYPE CODE.
const Box = require('3box');
const Web3 = require('web3');
const noLossDao = require('../../src/abis/NoLossDao_v0.json');

const INFURA_ENDPOINT =
  'https://kovan.infura.io/v3/e811479f4c414e219e7673b6671c2aba';
const DAO_ADDRESS = require('./lib/Constants.bs').getDaoAddress();
const web3Infura = new Web3(INFURA_ENDPOINT);

const getThreadFirstPost = async (threadAddress) => {
  let posts = await Box.getThreadByAddress(threadAddress);
  if (posts && posts.length > 0) {
    return posts[0];
  }
  return null;
};

const setupProposalManager = () => {
  const daoContract = new web3Infura.eth.Contract(noLossDao.abi, DAO_ADDRESS);

  let currentProposals = [];
  let proposalEmojiLookup = {};

  let getCurrentProposals = async () => {
    let numProposals = await daoContract.methods.proposalId().call();
    let currentProposals = [];
    for (let i = 1; i <= numProposals; i++) {
      let hash = await daoContract.methods.proposalDetails(i).call();
      if (!hash.includes('orbitdb')) {
        console.log(`Skipping ${hash} as it is not stored on a thread...`);
        continue;
      }
      let proposal = (await getThreadFirstPost(hash)).message;
      proposal.id = i;

      let owner = await daoContract.methods.proposalOwner(i).call();
      proposal.owner = owner;
      currentProposals.push({ ...proposal });
      proposalEmojiLookup[proposal.emoji] = { ...proposal };
    }

    console.log('current proposals', currentProposals);
  };
  let getIteration = async () => {
    let proposalIteration = await daoContract.methods
      .proposalIteration()
      .call();

    console.log(proposalIteration);
    return parseInt(proposalIteration.toString());
  };

  let getProjects = async () => {
    let proposalIteration = await daoContract.methods
      .proposalIteration()
      .call();

    console.log(proposalIteration);
    return parseInt(proposalIteration.toString());
  };

  const getProjectIdFromEmoji = (emoji) => {
    const project = getProjectIdFromEmoji[emoji];
    if (!!project) {
      return project.id;
    } else {
      return undefined;
    }
  };

  return {
    currentProposals,
    proposalEmojiLookup,
    getCurrentProposals,
    getProjectIdFromEmoji,
    getIteration,
  };
};

module.exports = {
  setupProposalManager,
};
