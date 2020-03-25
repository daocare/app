pragma solidity ^0.5.0;

contract IPoolDeposits {
  mapping(address => uint256) public depositedDai;

  function usersDeposit(address userAddress) external view returns (uint256);

  function redirectInterestStreamToWinner(address _winner) external;

}
