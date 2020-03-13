pragma solidity ^0.5.0;

contract INoLossDao {
  function canDeposit(address userAddress) external view returns (bool);
  function canWithdraw(address userAddress) external view returns (bool);

  function setUserIterationJoined(address _address) public;
  function resetUserIterationJoined(address _address) public;

}
