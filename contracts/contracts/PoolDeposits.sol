pragma solidity 0.5.16;

//import './interfaces/IERC20.sol';
import './interfaces/IAaveLendingPool.sol';
import './interfaces/IADai.sol';
import './interfaces/INoLossDao.sol';
import './NoLossDao.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract PoolDeposits is Initializable {
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

  function initialize(
    address daiAddress,
    address aDaiAddress,
    address aavePoolAddress,
    address aavePoolCoreAddress,
    address noLossDaoAddress
  ) public initializer {
    daiContract = IERC20(daiAddress);
    aaveLendingContract = IAaveLendingPool(aavePoolAddress);
    adaiContract = IADai(aDaiAddress);
    aaveLendingContractCore = aavePoolCoreAddress;
    noLossDaoContract = INoLossDao(noLossDaoAddress);
    admin = msg.sender;
  }

  /**
    * @dev Returns the DAI deposited by this user
    * @param userAddress the user you would like to check
    * ?? I guess we don't need this function we could simply call the value from the contract
    */
  function usersDeposit(address userAddress) external view returns (uint256) {
    return depositedDai[userAddress];
  }

  /**
    * @dev Lets a user join DAOcare through depositing
    * @param amount the user wants to deposit into the DAOcare pool
    */
  function deposit(uint256 amount) public {
    // This is so much less granular now which I don't like
    require(
      noLossDaoContract.canDeposit(msg.sender) == true,
      'User not eligible to deposit'
    );

    // Get from aave lending pool the latest address....
    daiContract.transferFrom(msg.sender, address(this), amount);
    daiContract.approve(address(aaveLendingContractCore), amount);
    aaveLendingContract.deposit(address(daiContract), amount, 0);

    // Set here
    depositedDai[msg.sender] = amount;
    totalDepositedDai = totalDepositedDai.add(amount);

    // Set in NoLossDAo
    noLossDaoContract.setUserIterationJoined(msg.sender);
  }

  /**
     * @dev Lets a user withdraw their original amount sent to DAOcare
     */
  function withdrawDeposit() public {
    require(
      noLossDaoContract.canWithdraw(msg.sender) == true,
      'User not eligible to withdraw'
    );

    uint256 amount = depositedDai[msg.sender];

    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);

    noLossDaoContract.resetUserIterationJoined(msg.sender);

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  function createProposal(string memory proposalHash)
    public
    returns (uint256 newProposalId)
  {
    require(
      noLossDaoContract.canCreateProposal(msg.sender) == true,
      'User not eligible to create proposal'
    );

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

    uint256 proposalId = noLossDaoContract._setProposal(
      proposalHash,
      msg.sender
    );

    return proposalId;
  }

  function withdrawProposal() public {
    require(
      noLossDaoContract.canWithdrawProposal(msg.sender) == true,
      'Benefactor cannot withdraw proposal now'
    );
    noLossDaoContract._withdrawProposal(msg.sender);

    uint256 amount = depositedDai[msg.sender];
    depositedDai[msg.sender] = 0;
    totalDepositedDai = totalDepositedDai.sub(amount);

    adaiContract.redeem(amount);
    daiContract.transfer(msg.sender, amount);
  }

  function redirectInterestStreamToWinner(address _winner)
    external
    noLossDaoContractOnly
  {
    adaiContract.redirectInterestStream(_winner);
  }

}
