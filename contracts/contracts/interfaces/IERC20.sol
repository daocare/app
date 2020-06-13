pragma solidity ^0.6.0;

abstract contract IERC20 {
  function balanceOf(address user) external virtual view returns (uint256);

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external virtual returns (bool);

  function transfer(address recipient, uint256 amount)
    external
    virtual
    returns (bool);

  function allowance(address owner, address spender)
    external
    virtual
    view
    returns (uint256);

  function approve(address spender, uint256 amount)
    external
    virtual
    returns (bool);
}
