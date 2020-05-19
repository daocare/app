pragma solidity ^0.5.0;

import '../interfaces/IADai.sol';
import './MockERC20.sol';
// import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

import '@nomiclabs/buidler/console.sol';


// MOCK ONLY
contract ADai is IADai, MockERC20 {
  MockERC20 public dai;

  constructor(MockERC20 daiAddress)
    public
    MockERC20('Dai', 'D', 18, msg.sender)
  {
    dai = daiAddress;
  }

  function redeem(uint256 _amount) public {
    console.log(' **** aDai being redeemed by *****', msg.sender);
    console.log('Burning this amount of aDai: ', _amount);
    this.burnFrom(msg.sender, _amount);
    console.log('Sending this amount of dai: ', _amount);
    dai.mint(msg.sender, _amount);
    console.log(' **** aDai redemtpion successful *****');
  }
}
