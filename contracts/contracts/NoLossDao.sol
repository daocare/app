pragma solidity 0.5.16;

// import "./interfaces/IERC20.sol";
import './interfaces/IAaveLendingPool.sol';
import './interfaces/IADai.sol';
import './interfaces/IPoolDeposits.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract NoLossDao is Initializable {
  using SafeMath for uint256;

  //////// MASTER //////////////
  address public admin;
  //uint256 public totalDepositedDai;

  //////// Iteration specific //////////
  uint256 public votingInterval;
  uint256 public proposalIteration;

  ///////// Proposal specific ///////////
  //uint256 public proposalAmount; // Add mapping of the proposal amount per iteration...
  uint256 public proposalId;
  uint256 public proposalDeadline; // keeping track of time
  mapping(uint256 => string) public proposalDetails;
  mapping(address => uint256) public benefactorsProposal; // benefactor -> proposal id
  mapping(uint256 => address) public proposalOwner; // proposal id -> benefactor (1:1 mapping)
  enum ProposalState {DoesNotExist, Withdrawn, Active, Cooldown} // Add Cooldown state and pending state
  mapping(uint256 => ProposalState) public state; // ProposalId to current state

  //////// User specific //////////
  //mapping(address => uint256) public depositedDai;
  mapping(address => uint256) public iterationJoined; // Which iteration did user join DAO
  mapping(uint256 => mapping(address => uint256)) public usersNominatedProject; // iteration -> user -> chosen project

  //////// DAO / VOTE specific //////////
  mapping(uint256 => mapping(uint256 => uint256)) public proposalVotes; /// iteration -> proposalId -> num votes
  mapping(uint256 => uint256) public topProject;
  mapping(address => address) public voteDelegations;

  ///////// DEFI Contrcats ///////////
  IERC20 public daiContract;
  //IAaveLendingPool public aaveLendingContract;
  //IADai public adaiContract;
  //address public aaveLendingContractCore;

  IPoolDeposits public depositContract;
  //address public depositContractAddress;

  ////////////////////////////////////
  //////// Modifiers /////////////////
  ////////////////////////////////////
  modifier onlyAdmin() {
    require(msg.sender == admin, 'Not admin');
    _;
  }

  modifier blankUser() {
    require(
      depositContract.usersDeposit(msg.sender) == 0,
      'Person is already a user'
    );
    _;
  }

  modifier userStaked(address givenAddress) {
    require(
      depositContract.usersDeposit(givenAddress) > 0,
      'User has no stake'
    );
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
  // Work on this modifier to be more accurate
  modifier userHasNoActiveProposal(address givenAddress) {
    require(
      state[benefactorsProposal[givenAddress]] != ProposalState.Active,
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
      'User does not have proxy right'
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

  modifier depositContractOnly() {
    require(
      address(depositContract) == msg.sender, // Is this a valid way of getting the address?
      'function can only be called by deposit contract'
    );
    _;
  }

  ////////////////////////////////////
  //////// SETUP CONTRACT////////////
  //// NOTE: Upgradable at the moment
  function initialize(
    address daiAddress,
    address _depositContractAddress,
    uint256 _votingInterval
  ) public initializer {
    daiContract = IERC20(daiAddress);
    depositContract = IPoolDeposits(_depositContractAddress);
    admin = msg.sender;
    votingInterval = _votingInterval;

    proposalDeadline = now.add(_votingInterval);
  }

  ///////////////////////////////////
  /////// Config functions //////////
  ///////////////////////////////////
  function changeVotingInterval(uint256 newInterval) public onlyAdmin {
    votingInterval = newInterval;
  }

  // change miner reward

  function canDeposit(address userAddress) external view returns (bool) {
    //   blankUser // They haven't already deposited
    //   noProposal(msg.sender) // Checks they are not a benefactor
    //   allowanceAvailable(amount) // Apprroved DAI for this function
    //   requiredDai(msg.sender, amount)
    return false;
  }
  function canWithdraw(address userAddress) external view returns (bool) {
    //   userStaked(msg.sender)
    //   noVoteYet(msg.sender)
    //   userHasNoProposal(msg.sender)
    return false;
  }

  function canCreateProposal(address userAddress) external view returns (bool) {
    //   allowanceAvailable(proposalAmount)
    //   requiredDai(msg.sender, proposalAmount)
    //   userHasNoActiveProposal(msg.sender)
    //   blankUser()
    return false;
  }
  function canWithdrawProposal(address userAddress)
    external
    view
    returns (bool)
  {
    //   userHasActiveProposal(msg.sender)
    //   lockInFulfilled(msg.sender)
    return false;
  }

  function setUserIterationJoined(address userAddress)
    external
    depositContractOnly // Important as deposit contract sets this on deposit event
  {
    iterationJoined[userAddress] = proposalIteration;
  }
  function resetUserIterationJoined(address userAddress)
    external
    depositContractOnly
  {
    iterationJoined[userAddress] = 0;
  }

  function _setProposal(string memory proposalHash, address benefactorAddress)
    public
    depositContractOnly
    returns (uint256 newProposalId)
  {
    // So the first proposal will have an ID of 1
    proposalId = proposalId.add(1);

    proposalDetails[proposalId] = proposalHash;
    proposalOwner[proposalId] = benefactorAddress;
    benefactorsProposal[benefactorAddress] = proposalId;
    state[proposalId] = ProposalState.Active;
    iterationJoined[benefactorAddress] = proposalIteration;
    return proposalId;
  }

  function _withdrawProposal(address benefactorAddress)
    public
    depositContractOnly
  {
    state[benefactorsProposal[benefactorAddress]] = ProposalState.Withdrawn;

  }

  //// DAO functionality
  function delegateVoting(address delegatedAddress)
    public
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender) //Careful when in cooldown can delegate then ???
    userHasNoActiveProposal(delegatedAddress)
  {
    voteDelegations[msg.sender] = delegatedAddress;
  }

  // Write a modifier not allowing proposals in cooldown to be voted for...
  function voteDirect(
    uint256 proposalIdToVoteFor // breaking change -> function name change from vote to voteDirect
  )
    public
    proposalActive(proposalIdToVoteFor)
    noVoteYet(msg.sender)
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender) // Or no cooldown proposal?
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
      .add(depositContract.usersDeposit(voteAddress));

    //uint256 temp = depositContract.usersDeposit(voteAddress);

    uint256 topProjectVotes = proposalVotes[proposalIteration][topProject[proposalIteration]];

    // Currently, proposal getting to top vote first will win [this is fine]
    if (
      proposalVotes[proposalIteration][proposalIdToVoteFor] > topProjectVotes
    ) {
      topProject[proposalIteration] = proposalIdToVoteFor;
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
    require(proposalDeadline < now, 'iteration interval not ended');

    // figure our what happens with the interest from the first proposal iteration
    // Possibly make first iteration an extended one for our launch (for marketing)
    if (topProject[proposalIteration] != 0) {
      // Do some asserts here for safety...

      // Only if last winner is not withdrawn (i.e. still in cooldown) make it active again
      if (state[topProject[proposalIteration - 1]] == ProposalState.Cooldown) {
        state[topProject[proposalIteration - 1]] = ProposalState.Active;
      }
      // Only if they haven't withdrawn, put them in cooldown
      if (state[topProject[proposalIteration]] != ProposalState.Withdrawn) {
        state[topProject[proposalIteration]] = ProposalState.Cooldown;
      }

      address winner = proposalOwner[topProject[proposalIteration]]; // error if no-one voted for in this iteration

      depositContract.redirectInterestStreamToWinner(winner);

    }
    //
    proposalDeadline = proposalDeadline.add(votingInterval);

    proposalIteration = proposalIteration.add(1);

    // send winning miner a little surprise [NFT]

  }

}
