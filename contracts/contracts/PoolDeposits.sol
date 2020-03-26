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

  // Mods

  modifier noLossDaoContractOnly() {
    require(
      address(noLossDaoContract) == msg.sender, // Is this a valid way of getting the address?
      'function can only be called by no Loss Dao contract'
    );
    _;
  }

  constructor(
    address daiAddress,
    address aDaiAddress,
    address aavePoolAddress,
    address aavePoolCoreAddress,
    address noLossDaoAddress
  ) public {
    daiContract = IERC20(daiAddress);
    //provider = LendingPoolAddressesProvider(/*contract_address*/);
    aaveLendingContract = IAaveLendingPool(aavePoolAddress);
    adaiContract = IADai(aDaiAddress);
    aaveLendingContractCore = aavePoolCoreAddress;
    noLossDaoContract = INoLossDao(noLossDaoAddress);
    admin = msg.sender;
  }

  function _depositFunds(uint256 amount) internal {
    // Get from aave lending pool the latest address....
    //LendingPoolAddressesProvider provider = LendingPoolAddressesProvider();
    /*contract_address*/
    // IAaveLendingPool lendingPool = IAaveLendingPool(provider.getLendingPool());

    daiContract.transferFrom(msg.sender, address(this), amount);
    daiContract.approve(address(aaveLendingContractCore), amount);
    aaveLendingContract.deposit(address(daiContract), amount, 0);

    depositedDai[msg.sender] = amount;
    totalDepositedDai = totalDepositedDai.add(amount);
  }

  function _withdrawFunds() internal {
    uint256 amount = depositedDai[msg.sender];

    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  /**
    * @dev Lets a user join DAOcare through depositing
    * @param amount the user wants to deposit into the DAOcare pool
    */
  function deposit(uint256 amount) external {
    uint256 usersBalance = depositedDai[msg.sender];
    _depositFunds(amount);
    noLossDaoContract.noLossDeposit(msg.sender, amount, usersBalance);
  }

  /**
     * @dev Lets a user withdraw their original amount sent to DAOcare
     * Calls the NoLossDao conrrtact to determine eligibility to withdraw
     * Withdraws the proposalAmount (50DAI) if succesful
     */
  function withdrawDeposit() external {
    uint256 usersBalance = depositedDai[msg.sender];
    _withdrawFunds();
    noLossDaoContract.noLossWithdraw(msg.sender, usersBalance);
  }

  function createProposal(string calldata proposalHash)
    external
    returns (uint256 newProposalId)
  {
    uint256 usersBalance = depositedDai[msg.sender];
    _depositFunds(proposalAmount);

    uint256 proposalId = noLossDaoContract.noLossCreateProposal(
      proposalHash,
      msg.sender,
      usersBalance,
      proposalAmount
    );
    return proposalId;
  }

  function withdrawProposal() external {
    _withdrawFunds();
    noLossDaoContract.noLossWithdrawProposal(msg.sender);
  }

  function redirectInterestStreamToWinner(address _winner)
    external
    noLossDaoContractOnly
  {
    adaiContract.redirectInterestStream(_winner);
  }

}
