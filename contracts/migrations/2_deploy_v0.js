// Load zos scripts and truffle wrapper function
const { scripts, ConfigManager } = require('@openzeppelin/cli');
const NoLossDao_v0 = artifacts.require('NoLossDao_v0');
const PoolDeposits = artifacts.require('PoolDeposits');
const { add, push, create } = scripts;

// lendingPoolAddressProvider kovan 0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5
// lendingPoolAddressProvider mainnet 0x24a42fD28C976A61Df5D00D0599C34c4f90748c8

// daiAddress kovan 0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD
// daiAddress mainnet 0x6B175474E89094C44Da98b954EedeAC495271d0F

// adai kovan 0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a
// adai mainnet 0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d

const addressLookup = {
  kovan: {
    aaveLendingPoolAddressProvider:
      '0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5',
    daiAddress: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
    adaiAddress: '0x58AD4cB396411B691A9AAb6F74545b2C5217FE6a',
  },
  mainnet: {
    aaveLendingPoolAddressProvider:
      '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
    daiAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    adaiAddress: '0xfC1E690f61EFd961294b3e1Ce3313fBD8aa4f85d',
  },
};

const applicationAmount = '50000000000000000000';

async function deploy(
  options,
  accounts,
  deployer,
  { adaiAddress, daiAddress, aaveLendingPoolAddressProvider }
) {
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

  //const noLossDaoAddress = '0xAc523606b34240A1d6C90CF1223f1B75136a14D1';
  //const poolDepositsAddress = '0x46441594290FC13e97dD2E2A9Cf49E114599bc38';

  const poolDeposits = await deployer.deploy(
    PoolDeposits,
    daiAddress,
    adaiAddress,
    aaveLendingPoolAddressProvider,
    noLossDaoAddress,
    applicationAmount,
    { from: accounts[0] }
  );

  let noLossDaoInstance = await NoLossDao_v0.at(noLossDao.address);

  // TODO: fix the interval here!
  await noLossDaoInstance.initialize(
    poolDeposits.address,
    '1209600' /*60×60×24×14 = 1209600 */,
    '5184000' /*2 months = 60*60*24*60= 5184000*/,
    {
      from: accounts[0],
      gas: 3000000,
    }
  );
}

module.exports = function(deployer, networkName, accounts) {
  deployer.then(async () => {
    // Don't try to deploy/migrate the contracts for tests
    if (networkName === 'test') {
      return;
    }
    const addresses = addressLookup[networkName];
    const { network, txParams } = await ConfigManager.initNetworkConfiguration({
      network: networkName,
      from: accounts[0],
    });
    await deploy({ network, txParams }, accounts, deployer, addresses);
  });
};
