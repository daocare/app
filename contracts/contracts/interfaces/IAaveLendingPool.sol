pragma solidity ^0.6.0;

abstract contract IAaveLendingPool {
  function deposit(
    address _reserve,
    uint256 _amount,
    uint16 _referralCode
  ) public virtual;
}
