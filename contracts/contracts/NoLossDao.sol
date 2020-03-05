pragma solidity 0.5.16;

// import "./interfaces/IERC20.sol";
import './interfaces/IAaveLendingPool.sol';
import './interfaces/IADai.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract NoLossDao is Initializable {
  using SafeMath for uint256;

  //////// MASTER //////////////
  address public admin;
  uint256 public totalDepositedDai;

  //////// Iteration specific //////////
  uint256 public votingInterval;
  uint256 public proposalIteration;

  ///////// Proposal specific ///////////
  uint256 public proposalAmount; // Add mapping of the proposal amount per iteration...
  uint256 public proposalId;
  uint256 public proposalDeadline; // keeping track of time
  mapping(uint256 => string) public proposalDetails;
  mapping(address => uint256) public benefactorsProposal; // benefactor -> proposal id
  mapping(uint256 => address) public proposalOwner; // proposal id -> benefactor (1:1 mapping)
  enum ProposalState {DoesNotExist, Withdrawn, Active} // Add Cooldown state and pending state
  mapping(uint256 => ProposalState) public state; // ProposalId to current state

  //////// User specific //////////
  mapping(address => uint256) public depositedDai;
  mapping(address => uint256) public iterationJoined; // Which iteration did user join DAO
  mapping(uint256 => mapping(address => uint256)) public usersNominatedProject; // iteration -> user -> chosen project

  //////// DAO / VOTE specific //////////
  mapping(uint256 => mapping(uint256 => uint256)) public proposalVotes; /// iteration -> proposalId -> num votes
  mapping(uint256 => uint256) public topProject;
  mapping(address => address) public voteDelegations;

  ///////// DEFI Contrcats ///////////
  IERC20 public daiContract;
  IAaveLendingPool public aaveLendingContract;
  IADai public adaiContract;
  address public aaveLendingContractCore;

  ////////////////////////////////////
  //////// Modifiers /////////////////
  ////////////////////////////////////
  modifier onlyAdmin() {
    require(msg.sender == admin, 'Not admin');
    _;
  }

  modifier blankUser() {
    require(depositedDai[msg.sender] == 0, 'Person is already a user');
    _;
  }

  modifier userStaked(address givenAddress) {
    require(depositedDai[givenAddress] > 0, 'User has no stake');
    _;
  }

  modifier noProposal(address givenAddress) {
    require(
      benefactorsProposal[givenAddress] == 0,
      'User already has a proposal'
    );
    _;
  }

  modifier noVoteYet(address givenAddress) {
    require(
      usersNominatedProject[proposalIteration][givenAddress] == 0,
      'User already voted this iteration'
    );
    _;
  }

  modifier userHasActiveProposal(address givenAddress) {
    require(
      state[benefactorsProposal[givenAddress]] == ProposalState.Active,
      'User proposal does not exist'
    );
    _;
  }

  modifier requiredDai(address givenAddress, uint256 amount) {
    require(
      daiContract.balanceOf(givenAddress) >= amount,
      'User does not have enough DAI'
    );
    _;
  }

  modifier userHasNoActiveProposal(address givenAddress) {
    require(
      benefactorsProposal[givenAddress] == 0 ||
        state[benefactorsProposal[givenAddress]] == ProposalState.Withdrawn,
      'User has an active proposal'
    );
    _;
  }

  modifier userHasNoProposal(address givenAddress) {
    require(benefactorsProposal[givenAddress] == 0, 'User has a proposal');
    _;
  }

  modifier proposalActive(uint256 propId) {
    require(state[propId] == ProposalState.Active, 'Proposal is not active');
    _;
  }

  modifier allowanceAvailable(uint256 amount) {
    require(
      amount <= daiContract.allowance(msg.sender, address(this)),
      'amount not available'
    );
    _;
  }

  modifier proxyRight(address delegatedFrom) {
    require(
      voteDelegations[delegatedFrom] == msg.sender,
      "User doesn't have proxy right"
    );
    _;
  }

  modifier joinedInTime(address givenAddress) {
    require(
      iterationJoined[givenAddress] < proposalIteration,
      'User only eligible to vote next iteration'
    );
    _;
  }

  modifier lockInFulfilled(address givenAddress) {
    require(
      iterationJoined[givenAddress] + 2 < proposalIteration,
      'Benefactor only eligible to receive funds in later iteration'
    );
    _;
  }
  ////////////////////////////////////
  //////// SETUP CONTRACT////////////
  //// NOTE: Upgradable at the moment
  function initialize(
    address daiAddress,
    address aDaiAddress,
    address aavePoolAddress,
    address aavePoolCoreAddress,
    uint256 _proposalAmount,
    uint256 _votingInterval
  ) public initializer {
    daiContract = IERC20(daiAddress);
    aaveLendingContract = IAaveLendingPool(aavePoolAddress);
    adaiContract = IADai(aDaiAddress);
    aaveLendingContractCore = aavePoolCoreAddress;
    admin = msg.sender;
    proposalAmount = _proposalAmount;
    votingInterval = _votingInterval;

    proposalDeadline = now.add(_votingInterval);
  }

  ///////////////////////////////////
  /////// Config functions //////////
  ///////////////////////////////////
  function changeVotingInterval(uint256 newInterval) public onlyAdmin {
    votingInterval = newInterval;
  }

  // Add function to change stake amount required for proposal

  // change miner reward

  ///////////////////////////////////
  ///// Users join and leave /////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////
  function deposit(uint256 amount)
    public
    blankUser // They haven't already deposited
    noProposal(msg.sender) // Checks they are not a benefactor
    allowanceAvailable(amount) // Apprroved DAI for this function
    requiredDai(msg.sender, amount)
  {
    daiContract.transferFrom(msg.sender, address(this), amount);
    daiContract.approve(address(aaveLendingContractCore), amount);
    aaveLendingContract.deposit(address(daiContract), amount, 0);

    //setting values
    depositedDai[msg.sender] = amount;
    totalDepositedDai = totalDepositedDai.add(amount);
    iterationJoined[msg.sender] = proposalIteration;
  }

  // MOST CRITICAL
  // Can't withdraw if voted
  function withdrawDeposit()
    public
    userStaked(msg.sender)
    noVoteYet(msg.sender)
    userHasNoProposal(msg.sender)
  {
    uint256 amount = depositedDai[msg.sender];

    //setting values
    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);
    iterationJoined[msg.sender] = 0; // setting to default (haven't joined)

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  ///////////////////////////////////
  /// Benefactors join and leave ////////////////////////////////////////////////////////////////////
  ///////////////////////////////////
  function createProposal(string memory proposalHash)
    public
    allowanceAvailable(proposalAmount)
    requiredDai(msg.sender, proposalAmount)
    userHasNoActiveProposal(msg.sender)
    blankUser()
    returns (uint256 newProposalId)
  {
    // DAI things. TODO: Approve where necessary
    daiContract.transferFrom(msg.sender, address(this), proposalAmount);
    daiContract.approve(address(aaveLendingContractCore), proposalAmount);
    aaveLendingContract.deposit(
      address(daiContract),
      proposalAmount,
      0 /* We should research this referal code stuff... https://developers.aave.com/#referral-program */
    );

    totalDepositedDai = totalDepositedDai.add(proposalAmount);
    depositedDai[msg.sender] = proposalAmount;

    // So the first proposal will have an ID of 1
    proposalId = proposalId.add(1);

    proposalDetails[proposalId] = proposalHash;
    proposalOwner[proposalId] = msg.sender;
    benefactorsProposal[msg.sender] = proposalId;
    state[proposalId] = ProposalState.Active;
    iterationJoined[msg.sender] = proposalIteration;
    return proposalId;
  }

  function withdrawProposal()
    public
    userHasActiveProposal(msg.sender)
    lockInFulfilled(msg.sender)
  {
    //This can only be executed after every cycle
    state[benefactorsProposal[msg.sender]] = ProposalState.Withdrawn;

    uint256 amount = depositedDai[msg.sender];
    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  ///////////////////////////////////
  //// DAO functionality ////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////
  function delegateVoting(address delegatedAddress)
    public
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender)
  {
    voteDelegations[msg.sender] = delegatedAddress;
  }

  function voteDirect(
    uint256 proposalIdToVoteFor // breaking change -> function name change from vote to voteDirect
  )
    public
    proposalActive(proposalIdToVoteFor)
    noVoteYet(msg.sender)
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender)
    joinedInTime(msg.sender)
  {
    _vote(proposalIdToVoteFor, msg.sender);
  }

  function voteProxy(uint256 proposalIdToVoteFor, address delegatedFrom)
    public
    proposalActive(proposalIdToVoteFor)
    proxyRight(delegatedFrom)
    noVoteYet(delegatedFrom)
    userStaked(delegatedFrom)
    userHasNoActiveProposal(delegatedFrom)
    joinedInTime(delegatedFrom)
  {
    _vote(proposalIdToVoteFor, delegatedFrom);
  }

  function _vote(uint256 proposalIdToVoteFor, address voteAddress) internal {
    usersNominatedProject[proposalIteration][voteAddress] = proposalIdToVoteFor;
    proposalVotes[proposalIteration][proposalIdToVoteFor] = proposalVotes[proposalIteration][proposalIdToVoteFor]
      .add(depositedDai[voteAddress]);

    uint256 topProjectVotes = proposalVotes[proposalIteration][topProject[proposalIteration]];

    // TODO:: if they are equal there is a problem (we must handle this!!)
    // Currently, proposal getting to top vote first wins
    if (proposalVotes[proposalIteration][proposalId] > topProjectVotes) {
      topProject[proposalIteration] = proposalId;
    }
  }

  // This function allows users to get their proportion of interest instead of redirecting
  // it to the winning project for the next weeks. (RAGE-QUIT but stay in pool function)
  function veto() public {}
  // Veto via twitter. v2 possibly.
  function vetoProxy() public {}

  ///////////////////////////////////
  //// Iteration changes/////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////
  function distributeFunds() public {
    // On a *whatever we decide basis* the funds are distributed to the winning project
    // E.g. every 2 weeks, the project with the most votes gets the generated interest.

    // anyone can call this when 2 cycle has ended - incentivize 'anyone' to call this transaction first and get a lil reward ;)
    require(proposalDeadline < now, 'current vote still active');

    // figure our what happens with the interest from the first proposal iteration
    // Possibly make first iteration an extended one for our launch (for marketing)
    if (topProject[proposalIteration] != 0) {
      // Do some asserts here for safety...
      address winner = proposalOwner[topProject[proposalIteration]]; // error if no-one voted for in this iteration
      adaiContract.redirectInterestStream(winner);
    }
    //
    proposalDeadline = proposalDeadline.add(votingInterval);

    proposalIteration = proposalIteration.add(1);
    topProject[proposalIteration] = 0;

    // send winning miner a little surprise [NFT]

  }

}
