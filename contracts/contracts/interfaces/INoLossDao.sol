pragma solidity ^0.5.0;

contract INoLossDao {
  function canDeposit(address userAddress) external view returns (bool);
  function canWithdraw(address userAddress) external view returns (bool);
  function canCreateProposal(address userAddress) external view returns (bool);
  function canWithdrawProposal(address userAddress)
    external
    view
    returns (bool);

  function setUserIterationJoined(address _address) public;
  function resetUserIterationJoined(address _address) public;

  function _setProposal(string memory proposalHash, address benefactorAddress)
    public
    returns (uint256 newProposalId);

  function _withdrawProposal(address benefactorAddress) public;

}
