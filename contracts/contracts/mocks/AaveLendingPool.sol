pragma solidity ^0.5.0;

import '../interfaces/IAaveLendingPool.sol';
import './MockERC20.sol';
// import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';
import '@nomiclabs/buidler/console.sol';


contract AaveLendingPool is IAaveLendingPool {
  using SafeMath for uint256;

  MockERC20 public aDai;
  MockERC20 public dai;

  constructor(MockERC20 aDaiAddress, MockERC20 daiAddress) public {
    aDai = aDaiAddress;
    dai = daiAddress;
  }

  function deposit(address _reserve, uint256 _amount, uint16 _referralCode)
    public
  {
    console.log(' **** deposit into Aave lendingPool by *****', msg.sender);
    dai.burnFrom(msg.sender, _amount);
    console.log('This amount of dai is being deposited ', _amount);
    uint256 amount = _amount.mul(2);
    console.log(
      'sending this amount of aDAi is being sent back in return:',
      amount
    );
    aDai.mint(msg.sender, amount);
    console.log(' **** Aave deposit finished successfully *****');
  }
}
