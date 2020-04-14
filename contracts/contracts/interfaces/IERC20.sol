pragma solidity ^0.5.0;


contract IERC20 {
  function balanceOf(address user) external view returns (uint256);

  function transferFrom(address sender, address recipient, uint256 amount)
    external
    returns (bool);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function allowance(address owner, address spender)
    external
    view
    returns (uint256);

  function approve(address spender, uint256 amount) external returns (bool);
}
