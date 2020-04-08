pragma solidity ^0.5.0;

import '../interfaces/IAaveLendingPool.sol';
import './MockERC20.sol';
// import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';
import '@nomiclabs/buidler/console.sol';

contract AaveLendingPool is IAaveLendingPool {
  using SafeMath for uint256;

  MockERC20 public aDai;
  MockERC20 public dai;
  constructor(MockERC20 aDaiAddress, MockERC20 daiAddress) public
  {
    aDai = aDaiAddress;
    dai = daiAddress;
  }
  function deposit(address _reserve, uint256 _amount, uint16 _referralCode)
    public
  {
    dai.burnFrom(msg.sender, _amount);

    console.log("This amount of dai being deposited ", _amount, "by: ", msg.sender);
    uint256 amount = _amount.mul(2);
    console.log("sending this amount of aDAi:", amount, "to ", msg.sender);
    aDai.mint(msg.sender, amount);
  }
}
