// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const DaiContract = artifacts.require('MockERC20');
const NoLossDao = artifacts.require('NoLossDao');
const PoolDeposits = artifacts.require('PoolDeposits');
const { add, push, create } = scripts;

const daiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD';
const aavePoolAddress = '0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c';
const aavePoolCoreAddress = '0x95D1189Ed88B380E319dF73fF00E479fcc4CFa45';
const adaiAddress = '0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a';
const applicationAmount = '50000000000000000000';

async function deploy(options, accounts) {
  const noLossDao = await NoLossDao.new({ from: accounts[0] });

  const poolDeposits = await PoolDeposits.new(
    daiAddress,
    adaiAddress,
    aavePoolAddress,
    aavePoolCoreAddress,
    noLossDao.address,
    applicationAmount,
    { from: accounts[0] }
  );

  // TODO: fix the interval here!
  await noLossDao.initialize(poolDeposits.address, '1800', {
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
    await deploy({ network, txParams }, accounts);
  });
};
