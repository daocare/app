pragma solidity ^0.6.0;

import './IERC20.sol';

abstract contract IADai is IERC20 {
  function redeem(uint256 _amount) public virtual;
  // function redirectInterestStream(address _to) public virtual;
}
