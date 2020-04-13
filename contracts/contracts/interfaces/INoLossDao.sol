pragma solidity ^0.5.0;


contract INoLossDao {
  function noLossDeposit(address userAddress) external returns (bool);

  function noLossWithdraw(address userAddress) external returns (bool);

  function noLossCreateProposal(
    string calldata proposalHash,
    address benefactorAddress
  ) external returns (uint256 newProposalId);

  function noLossWithdrawProposal(address benefactorAddress)
    external
    returns (bool);
}
