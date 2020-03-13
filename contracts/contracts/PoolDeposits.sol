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

  ///////// DEFI Contrcats ///////////
  IERC20 public daiContract;
  IAaveLendingPool public aaveLendingContract;
  IADai public adaiContract;
  INoLossDao public noLossDaoContract;
  address public aaveLendingContractCore;

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

  function deposit(uint256 amount) public {
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

}
