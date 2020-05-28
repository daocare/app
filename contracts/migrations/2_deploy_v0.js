// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const NoLossDao_v0 = artifacts.require('NoLossDao_v0');
const PoolDeposits = artifacts.require('PoolDeposits');
const { add, push, create } = scripts;

// lendingPoolAddressProvider should be one of below depending on deployment
// kovan 0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5
// mainnet 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
const lendingPoolAddressProvider = '0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5';
const daiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD';
//const aavePoolAddress = '0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c';
//const aavePoolCoreAddress = '0x95D1189Ed88B380E319dF73fF00E479fcc4CFa45';
const adaiAddress = '0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a';
const applicationAmount = '50000000000000000000';

async function deploy(options, accounts, deployer) {
  add({
    contractsData: [{ name: 'NoLossDao_v0', alias: 'NoLossDao' }],
  });

  // Push implementation contracts to the network
  await push({ ...options, force: true }); // I have to use force here because OpenZeppelin is being difficult :/ (and this is a hacky solution anyway...)

  // Create instance
  const noLossDao = await create({
    ...options,
    contractAlias: 'NoLossDao',
  });

  const poolDeposits = await deployer.deploy(
    PoolDeposits,
    daiAddress,
    adaiAddress,
    lendingPoolAddressProvider,
    //aavePoolAddress,
    //aavePoolCoreAddress,
    noLossDao.address,
    applicationAmount,
    { from: accounts[0] }
  );

  let noLossDaoInstance = await NoLossDao_v0.at(noLossDao.address);

  // TODO: fix the interval here!
  await noLossDaoInstance.initialize(poolDeposits.address, '30', {
    from: accounts[0],
  });
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    // Don't try to deploy/migrate the contracts for tests
    if (networkName === 'test') {
      return;
    }
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: accounts[0],
    });
    await deploy({ network, txParams }, accounts, deployer);
  });
};
