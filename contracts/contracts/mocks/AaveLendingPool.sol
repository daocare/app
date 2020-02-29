pragma solidity ^0.5.0;

import "../interfaces/IAaveLendingPool.sol";
import "./MockERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20.sol";

contract AaveLendingPool is IAaveLendingPool {
    MockERC20 public aDai;
    constructor(MockERC20 aDaiAddress) public {
        aDai = aDaiAddress;
    }
    function deposit(address _reserve, uint256 _amount, uint16 _referralCode)
        public
    {
        // For now, do nothing
    }
}
