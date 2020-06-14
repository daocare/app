pragma solidity ^0.6.0;

abstract contract INoLossDao {
  function userHasNotVotedThisIteration(address userAddress)
    external
    virtual
    view
    returns (bool);

  function noLossDeposit(address userAddress) external virtual returns (bool);

  function noLossWithdraw(address userAddress) external virtual returns (bool);

  function noLossCreateProposal(
    string calldata proposalHash,
    address benefactorAddress
  ) external virtual returns (uint256 newProposalId);

  function noLossWithdrawProposal(address benefactorAddress)
    external
    virtual
    returns (bool);
}
