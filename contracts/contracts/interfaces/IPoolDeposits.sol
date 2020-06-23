pragma solidity ^0.6.0;

abstract contract IPoolDeposits {
  mapping(address => uint256) public depositedDai;

  function usersDeposit(address userAddress)
    external
    virtual
    view
    returns (uint256);

  function changeProposalAmount(uint256 amount) external virtual;

  function redirectInterestStreamToWinner(address _winner) external virtual;

  function distributeInterest(
    address[] calldata receivers,
    uint256[] calldata percentages,
    address winner,
    uint256 iteration
  ) external virtual;
}
