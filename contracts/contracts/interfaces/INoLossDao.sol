pragma solidity ^0.5.0;

contract INoLossDao {
  function noLossDeposit(
    address userAddress,
    uint256 amountToDeposit,
    uint256 currentDeposit
  ) external returns (bool);
  function noLossWithdraw(address userAddress, uint256 userBalance)
    external
    returns (bool);

  function noLossCreateProposal(
    string calldata proposalHash,
    address benefactorAddress,
    uint256 currentDeposit,
    uint256 proposalAmount
  ) external returns (uint256 newProposalId);

  function noLossWithdrawProposal(address benefactorAddress)
    external
    returns (bool);

}
