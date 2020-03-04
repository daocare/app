pragma solidity ^0.5.0;

import '../interfaces/IADai.sol';
import './MockERC20.sol';
// import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

// MOCK ONLY
contract ADai is IADai, MockERC20 {
  MockERC20 public dai;
  constructor(MockERC20 daiAddress)
    public
    MockERC20('aDai', 'AD', 18, msg.sender)
  {
    dai = daiAddress;
  }
  function redeem(uint256 _amount) public {
    dai.mint(msg.sender, _amount);
  }
  function redirectInterestStream(address _to) public {}
}
