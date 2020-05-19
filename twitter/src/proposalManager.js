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
  let emojiList = [];

  let getCurrentProposals = async () => {
    let newCurrentProposals = [];
    let newProposalEmojiLookup = {};
    let newEmojiList = [];

    let numProposals = await daoContract.methods.proposalId().call();
    let currentProposals = [];
    for (let i = 1; i <= numProposals; i++) {
      let hash = await daoContract.methods.proposalDetails(i).call();
      if (!hash.includes('orbitdb')) {
        console.log(`Skipping ${hash} as it is not stored on a thread...`);
        continue;
      }
      const proposalRaw = await getThreadFirstPost(hash);
      console.log('the raw proposal', proposalRaw, !proposalRaw);
      if (!proposalRaw) {
        // If the proposal is null just continue!
        console.log('it should continue');
        continue;
      }
      const proposal = proposalRaw.message;
      // let proposal = (await getThreadFirstPost(hash)).message;
      proposal.id = i;

      let owner = await daoContract.methods.proposalOwner(i).call();
      proposal.owner = owner;
      newCurrentProposals.push({ ...proposal });
      newProposalEmojiLookup[proposal.emoji] = { ...proposal };
      newEmojiList.push(proposal.emoji);
    }
    currentProposals = newCurrentProposals;
    proposalEmojiLookup = newProposalEmojiLookup;
    emojiList = newEmojiList;
    console.log(proposalEmojiLookup);
  };
  let getIteration = async () => {
    let proposalIteration = await daoContract.methods
      .proposalIteration()
      .call();

    console.log(proposalIteration);
    return parseInt(proposalIteration.toString());
  };

  let getProjectsTweetString = async () => {
    let projectTweetString = '';
    for (let i = 0; i <= emojiList.length; i++) {
      projectTweetString +=
        emojiList[i] + ' ' + proposalEmojiLookup[emojiList[i]].team[0] + '\n';
    }

    return parseInt(proposalIteration.toString());
  };

  const getProjectIdFromEmoji = (emoji) => {
    const project = proposalEmojiLookup[emoji];

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
    getProjectsTweetString,
  };
};

module.exports = {
  setupProposalManager,
};
