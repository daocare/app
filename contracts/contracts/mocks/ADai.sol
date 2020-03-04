pragma solidity ^0.5.0;

import '../interfaces/IADai.sol';
import './MockERC20.sol';
import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol';

contract ADai is IADai {
  MockERC20 public aDai;
  constructor(MockERC20 aDaiAddress) public {
    aDai = aDaiAddress;
  }
  function redeem(uint256 _amount) public {
    // For now, do nothing
  }
}
