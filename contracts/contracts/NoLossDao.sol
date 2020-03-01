pragma solidity 0.5.16;

// import "./interfaces/IERC20.sol";
import './interfaces/IAaveLendingPool.sol';
import './interfaces/IADai.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract NoLossDao is Initializable {
  using SafeMath for uint256;

  mapping(address => uint256) public depositedDai;
  mapping(uint256 => address) public proposalOwner;
  mapping(uint256 => string) public proposalDetails;
  mapping(uint256 => mapping(uint256 => uint256)) public proposalVotes;

  mapping(uint256 => mapping(address => uint256)) public usersNominatedProject; // Means user can only have one project.
  mapping(address => uint256) public usersProposedProject;
  mapping(address => uint256) public iterationJoined;

  mapping(uint256 => uint256) public topProject;

  uint256 public totalDepositedDai;
  uint256 public proposalAmount;

  IERC20 public daiContract;
  IAaveLendingPool public aaveLendingContract;
  address public aaveLendingContractCore;
  IADai public adaiContract;
  address public admin;

  uint256 public proposalIteration;

  uint256 proposalId;
  enum ProposalState {Active, Withdrawn} // Cooldown
  mapping(uint256 => ProposalState) public state; // ProposalId to current state

  mapping(address => address) public voteDelegations;

  uint256 public votingInterval;
  uint256 public proposalDeadline;

  modifier onlyAdmin() {
    require(msg.sender == admin, 'Not admin');
    _;
  }

  modifier blankUser() {
    require(depositedDai[msg.sender] == 0, 'User already exists');
    _;
  }

  modifier userStaked(address givenAddress) {
    require(depositedDai[givenAddress] > 0, 'User has no stake');
    _;
  }

  modifier noProposal(address givenAddress) {
    require(
      usersProposedProject[givenAddress] == 0,
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
      state[usersProposedProject[givenAddress]] == ProposalState.Active,
      "User doesn't have an active proposal"
    );
    _;
  }

  modifier userHasNoActiveProposal(address givenAddress) {
    require(
      state[usersProposedProject[givenAddress]] == ProposalState.Withdrawn ||
        usersProposedProject[givenAddress] == 0,
      'User has an active proposal'
    );
    _;
  }

  modifier proposalActive(uint256 propId) {
    require(state[propId] == ProposalState.Active, "Proposal isn't active");
    _;
  }

  modifier allowanceAvailable(uint256 amount) {
    require(
      amount <= daiContract.allowance(msg.sender, address(this)),
      'amount not available'
    );
    _;
  }

  // Modifiers for proxy
  modifier proxyRight(address delegatedFrom) {
    require(
      voteDelegations[delegatedFrom] == msg.sender,
      "User doesn't have proxy right"
    );
    _;
  }

  // Modifiers for proxy
  modifier joinedInTime(address givenAddress) {
    require(
      iterationJoined[givenAddress] < proposalIteration,
      'User only eligible to vote next iteration'
    );
    _;
  }

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

  function changeVotingInterval(uint256 newInterval) public onlyAdmin {
    votingInterval = newInterval;
  }

  // This will return an empty array if no proposal added
  //   function proposalHashes() public view returns (string[] memory) {
  //     string[] memory myHashes = new string[](proposalId);
  //     for (uint256 i = 1; i <= proposalId; i++) {
  //       myHashes[i - 1] = proposalDetails[i];
  //     }
  //     return myHashes;
  //   }

  function deposit(uint256 amount)
    public
    blankUser
    noProposal(msg.sender)
    allowanceAvailable(amount)
  {
    daiContract.transferFrom(msg.sender, address(this), amount);
    daiContract.approve(address(aaveLendingContractCore), amount);
    aaveLendingContract.deposit(address(daiContract), amount, 0);

    //setting values
    depositedDai[msg.sender] = amount;
    totalDepositedDai = totalDepositedDai.add(amount);
    iterationJoined[msg.sender] = proposalIteration;
  }

  function withdrawFull(uint256 amount) public {
    // Participant withdraws all there DAI and exits our system :(
    // Check the user exists in our system
    // Check the amount they have deposited
    // Exchange aDAI to DAI for this amount
    // Send them back their dai
    // Remove their amount of dai from the total we have
    // IMPORTANT, remove their vote amount...
  }

  function createProposal(string memory proposalHash)
    public
    allowanceAvailable(proposalAmount)
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
    depositedDai[msg.sender] = depositedDai[msg.sender].add(proposalAmount);

    // So the first proposal will have an ID of 1
    proposalId = proposalId.add(1);
    newProposalId = proposalId;

    proposalDetails[newProposalId] = proposalHash;
    proposalOwner[newProposalId] = msg.sender;
    state[newProposalId] = ProposalState.Active;
  }

  function withdrawProposal() public userHasActiveProposal(msg.sender) {
    //This can only be executed after every cycle
    state[usersProposedProject[msg.sender]] = ProposalState.Withdrawn;
    totalDepositedDai = totalDepositedDai.sub(proposalAmount);
    depositedDai[msg.sender] = 0;
    // TODO
    // Remove proposalAmount from aDAI
    // Convert to DAI
    // Send back to owner
  }

  function vote(uint256 proposalIdToVoteFor)
    public
    proposalActive(proposalIdToVoteFor)
    noVoteYet(msg.sender)
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender)
    joinedInTime(msg.sender)
  {
    proposalVotes[proposalIteration][proposalIdToVoteFor] = proposalVotes[proposalIteration][proposalIdToVoteFor]
      .add(depositedDai[msg.sender]);
    usersNominatedProject[proposalIteration][msg.sender] = proposalIdToVoteFor;

    uint256 topProjectVotes = proposalVotes[proposalIteration][topProject[proposalIteration]];

    // TODO:: if they are equal there is a problem (we must handle this!!)
    if (proposalVotes[proposalIteration][proposalId] > topProjectVotes) {
      topProject[proposalIteration] = proposalId;
    }
  }

  function distributeFunds() public {
    // On a *whatever we decide basis* the funds are distributed to the winning project
    // E.g. every 2 weeks, the project with the most votes gets the generated interest.

    require(proposalDeadline > now, 'current vote still active');

    if (topProject[proposalIteration] != 0) {
      uint256 interestEarnedSinceLastIteration = adaiContract
        .balanceOf(address(this))
        .sub(totalDepositedDai);

      adaiContract.redeem(interestEarnedSinceLastIteration);

      // Do some asserts here for safety...

      address winner = proposalOwner[topProject[proposalIteration]];
      uint256 amount = daiContract.balanceOf(address(this));

      daiContract.transfer(winner, amount);
    }

    proposalDeadline = proposalDeadline.add(votingInterval);

    proposalIteration = proposalIteration.add(1);
    topProject[proposalIteration] = 0;
  }

  function delegateVoting(address delegatedAddress)
    public
    userStaked(msg.sender)
    userHasNoActiveProposal(msg.sender)
  {
    voteDelegations[msg.sender] = delegatedAddress;
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
    // CODE DUPLICATION: CAREFUL OF CHANGES IN BOTH
    proposalVotes[proposalIteration][proposalIdToVoteFor] = proposalVotes[proposalIteration][proposalIdToVoteFor]
      .add(depositedDai[delegatedFrom]);
    usersNominatedProject[proposalIteration][delegatedFrom] = proposalIdToVoteFor;

    uint256 topProjectVotes = proposalVotes[proposalIteration][topProject[proposalIteration]];

    // TODO:: if they are equal there is a problem (we must handle this!!)
    if (proposalVotes[proposalIteration][proposalId] > topProjectVotes) {
      topProject[proposalIteration] = proposalId;
    }
  }

}
