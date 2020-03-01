// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const { add, push, create } = scripts;

const daiAddress = '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD';
const aavePoolAddress = '0x580D4Fdc4BF8f9b5ae2fb9225D584fED4AD5375c';
const adaiAddress = '0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a';

async function deploy(options, accounts) {
  add({
    contractsData: [{ name: 'NoLossDao', alias: 'NoLossDao' }],
  });

  // NOTE: IT IS EXTREMELY BAD THAT WE NEED TO USE FORCE ON INITIAL DEPLOYMENT. IT MEANS THERE IS A BUG OF SORTS
  await push({ ...options, force: true });

  const noLossDao = await create({
    ...options,
    contractAlias: 'NoLossDao',
    methodName: 'initialize',
    methodArgs: [
      daiAddress,
      adaiAddress,
      aavePoolAddress,
      '50000000000000000000',
      1800,
    ],
    force: true,
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
