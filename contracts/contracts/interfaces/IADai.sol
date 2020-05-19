pragma solidity ^0.5.0;

import './IERC20.sol';


contract IADai is IERC20 {
  function redeem(uint256 _amount) public;
  // function redirectInterestStream(address _to) public;
}
