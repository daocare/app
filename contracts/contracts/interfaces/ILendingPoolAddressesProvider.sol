pragma solidity ^0.6.0;

abstract contract ILendingPoolAddressesProvider {
  function getLendingPool() public virtual view returns (address);

  function getLendingPoolCore() public virtual view returns (address);
}

// INSERT LATER INTO NOLOSSDAO
// Therefore, whenever it's required to access the LendingPool contract
// it is recommended to fetch the correct address from the LendingPoolAddressesProvider smart contract.

// Just want to get it to compile. coIo'lll suese this terminal ::DD
// LendingPoolAddressesProvider provider = LendingPoolAddressesProvider(
//     0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
// );
// LendingPool lendingPool = LendingPool(provider.getLendingPool());
