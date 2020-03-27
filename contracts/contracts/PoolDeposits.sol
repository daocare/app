pragma solidity 0.5.16;

//import './interfaces/IERC20.sol';
import './interfaces/IAaveLendingPool.sol';
import './interfaces/IADai.sol';
import './interfaces/INoLossDao.sol';
import './NoLossDao.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract PoolDeposits {
  using SafeMath for uint256;

  address public admin;
  uint256 public totalDepositedDai;
  mapping(address => uint256) public depositedDai;

  uint256 public proposalAmount; // Add mapping of the proposal amount per iteration...

  ///////// DEFI Contrcats ///////////
  IERC20 public daiContract;
  IAaveLendingPool public aaveLendingContract;
  IADai public adaiContract;
  INoLossDao public noLossDaoContract;
  address public aaveLendingContractCore;

  // EMERGENCY MODULES
  uint256 public emergencyVoteAmount;
  mapping(address => bool) public emergencyVoted;
  mapping(address => uint256) public timeJoined;
  bool public isEmergencyState;

  modifier emergencyEnacted() {
    require(
      totalDepositedDai < emergencyVoteAmount.mul(2), //safe 50%
      '50% of total pool needs to have voted for emergency state'
    );
    require(
      totalDepositedDai > 200000000000000000000000, //200 000 DAI needed in contract
      '200 000DAI required in pool before emergency state can be declared'
    );
    _;
  }

  modifier noEmergencyVoteYet() {
    require(emergencyVoted[msg.sender] == false, 'Already voted for emergency');
    _;
  }

  modifier stableState() {
    require(isEmergencyState == false, 'State of emergency declared');
    _;
  }

  modifier emergencyState() {
    require(isEmergencyState == true, 'State of emergency not declared');
    _;
  }

  // Required to be part of the pool for 100 days. Make it costly to borrow and put into state of emergency.
  modifier eligibleToEmergencyVote() {
    require(
      timeJoined[msg.sender].add(8640000) < now,
      'Need to have joined for 100days to vote an emergency'
    );
    _;
  }

  // Mods
  modifier noLossDaoContractOnly() {
    require(
      address(noLossDaoContract) == msg.sender, // Is this a valid way of getting the address?
      'function can only be called by no Loss Dao contract'
    );
    _;
  }

  modifier allowanceAvailable(uint256 amount) {
    require(
      amount <= daiContract.allowance(msg.sender, address(this)), // checking the pool deposits contract
      'amount not available'
    );
    _;
  }

  modifier requiredDai(uint256 amount) {
    require(
      daiContract.balanceOf(msg.sender) >= amount,
      'User does not have enough DAI'
    );
    _;
  }

  modifier blankUser() {
    require(depositedDai[msg.sender] == 0, 'Person is already a user');
    _;
  }

  modifier userStaked() {
    require(depositedDai[msg.sender] > 0, 'User has no stake');
    _;
  }

  constructor(
    address daiAddress,
    address aDaiAddress,
    address aavePoolAddress,
    address aavePoolCoreAddress,
    address noLossDaoAddress,
    uint256 _proposalAmount
  ) public {
    daiContract = IERC20(daiAddress);
    //provider = LendingPoolAddressesProvider(/*contract_address*/);
    aaveLendingContract = IAaveLendingPool(aavePoolAddress);
    adaiContract = IADai(aDaiAddress);
    aaveLendingContractCore = aavePoolCoreAddress;
    noLossDaoContract = INoLossDao(noLossDaoAddress);
    admin = msg.sender;
    proposalAmount = _proposalAmount; // if we want this configurable put in other contract
    isEmergencyState = false;
  }

  function _depositFunds(uint256 amount) internal {
    // Get from aave lending pool the latest address....
    //LendingPoolAddressesProvider provider = LendingPoolAddressesProvider();
    /*contract_address*/
    // IAaveLendingPool lendingPool = IAaveLendingPool(provider.getLendingPool());
    daiContract.transferFrom(msg.sender, address(this), amount);
    daiContract.approve(address(aaveLendingContractCore), amount);
    aaveLendingContract.deposit(address(daiContract), amount, 0);

    timeJoined[msg.sender] = now;
    depositedDai[msg.sender] = amount;
    totalDepositedDai = totalDepositedDai.add(amount);
  }

  function _withdrawFunds() internal {
    uint256 amount = depositedDai[msg.sender];
    _removeEmergencyVote();

    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  /**
    * @dev Lets a user join DAOcare through depositing
    * @param amount the user wants to deposit into the DAOcare pool
    */
  function deposit(uint256 amount)
    external
    blankUser
    allowanceAvailable(amount)
    requiredDai(amount)
    stableState
  {
    _depositFunds(amount);
    noLossDaoContract.noLossDeposit(msg.sender);
  }

  /**
     * @dev Lets a user withdraw their original amount sent to DAOcare
     * Calls the NoLossDao conrrtact to determine eligibility to withdraw
     * Withdraws the proposalAmount (50DAI) if succesful
     */
  function withdrawDeposit() external userStaked {
    _withdrawFunds();
    noLossDaoContract.noLossWithdraw(msg.sender);
  }

  /**
     * @dev Lets user create proposal
     */
  function createProposal(string calldata proposalHash)
    external
    blankUser
    allowanceAvailable(proposalAmount)
    requiredDai(proposalAmount)
    stableState
    returns (uint256 newProposalId)
  {
    _depositFunds(proposalAmount);
    uint256 proposalId = noLossDaoContract.noLossCreateProposal(
      proposalHash,
      msg.sender
    );
    return proposalId;
  }

  /**
     * @dev Lets user withdraw proposal
     */
  function withdrawProposal() external {
    _withdrawFunds();
    noLossDaoContract.noLossWithdrawProposal(msg.sender);
  }

  /**
     * @dev Sets the interest to acrue to winner
     */
  function redirectInterestStreamToWinner(address _winner)
    external
    noLossDaoContractOnly
  {
    adaiContract.redirectInterestStream(_winner);
  }

  ///////////////////
  // EMERGENCY MODULE
  ///////////////////
  function declareStateOfEmergency() external emergencyEnacted {
    isEmergencyState = true;
  }

  function emergencyWithdraw() external userStaked emergencyState {
    _withdrawFunds();
  }

  // Require time lock here to defeat flash loan punks
  function voteEmergency()
    external
    userStaked
    noEmergencyVoteYet
    eligibleToEmergencyVote
  {
    emergencyVoted[msg.sender] = true;
    emergencyVoteAmount = emergencyVoteAmount.add(depositedDai[msg.sender]);
  }

  function _removeEmergencyVote() internal {
    bool status = emergencyVoted[msg.sender];
    emergencyVoted[msg.sender] = false;
    if (status == true) {
      emergencyVoteAmount = emergencyVoteAmount.sub(depositedDai[msg.sender]);
    }
  }

}
