pragma solidity ^0.6.0;

import '../interfaces/ILendingPoolAddressesProvider.sol';
import './AaveLendingPool.sol';

contract LendingPoolAddressesProvider is ILendingPoolAddressesProvider {
  AaveLendingPool public aaveLendingPool;

  constructor(AaveLendingPool aaveLendingPoolAddress) public {
    aaveLendingPool = aaveLendingPoolAddress;
  }

  function getLendingPool() public override view returns (address) {
    return address(aaveLendingPool);
  }

  function getLendingPoolCore() public override view returns (address) {
    return address(aaveLendingPool);
  }
}
