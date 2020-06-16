// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const NoLossDao_v0 = artifacts.require('NoLossDao_v0');
const PoolDeposits = artifacts.require('PoolDeposits');
const { add, push, create } = scripts;

// lendingPoolAddressProvider should be one of below depending on deployment
// kovan 0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5
// mainnet 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8
const lendingPoolAddressProvider = '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8';
const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // daiAddress kovan 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD
//const aavePoolAddress = '0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c';
//const aavePoolCoreAddress = '0x95D1189Ed88B380E319dF73fF00E479fcc4CFa45';
// https://etherscan.io/token/0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d
const adaiAddress = '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d'; // kovan adai 0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a
const applicationAmount = '50000000000000000000';

async function deploy(options, accounts, deployer) {
  add({
    contractsData: [{ name: 'NoLossDao_v0', alias: 'NoLossDao' }],
  });
  console.log('1');

  // Push implementation contracts to the network
  await push({ ...options, force: true }); // I have to use force here because OpenZeppelin is being difficult :/ (and this is a hacky solution anyway...)
  console.log('2');

  // Create instance
  const noLossDao = await create({
    ...options,
    contractAlias: 'NoLossDao',
  });

  console.log('3');
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
  console.log('4');

  let noLossDaoInstance = await NoLossDao_v0.at(noLossDao.address);

  console.log('5');
  // TODO: fix the interval here!
  await noLossDaoInstance.initialize(
    poolDeposits.address,
    '1209600' /*60×60×24×14*/,
    '5184000' /*2 months = 60*60*24*60*/,
    {
      from: accounts[0],
    }
  );
  console.log('6');
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    // Don't try to deploy/migrate the contracts for tests
    if (networkName === 'test') {
      return;
    }
    console.log('setup');
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: accounts[0],
    });
    console.log('config');
    await deploy({ network, txParams }, accounts, deployer);
    console.log('done');
  });
};
