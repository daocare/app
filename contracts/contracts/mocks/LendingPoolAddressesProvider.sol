pragma solidity ^0.5.0;

import '../interfaces/ILendingPoolAddressesProvider.sol';
import './AaveLendingPool.sol';


contract LendingPoolAddressesProvider is ILendingPoolAddressesProvider {
  AaveLendingPool public aaveLendingPool;

  constructor(AaveLendingPool aaveLendingPoolAddress) public {
    aaveLendingPool = aaveLendingPoolAddress;
  }

  function getLendingPool() public view returns (address) {
    return address(aaveLendingPool);
  }

  function getLendingPoolCore() public view returns (address) {
    return address(aaveLendingPool);
  }
}
