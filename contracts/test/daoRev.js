const {
  BN,
  expectRevert,
  ether,
  expectEvent,
  balance,
  time,
} = require('@openzeppelin/test-helpers');

const PoolDeposits = artifacts.require('PoolDeposits');
const NoLossDao = artifacts.require('NoLossDao_v0');
const AaveLendingPool = artifacts.require('AaveLendingPool');
const LendingPoolAddressProvider = artifacts.require(
  'LendingPoolAddressesProvider'
);
const ERC20token = artifacts.require('MockERC20');
const ADai = artifacts.require('ADai');

contract('noLossDao', (accounts) => {
  let aaveLendingPool;
  let lendingPoolAddressProvider;
  let poolDeposits;
  let noLossDao;
  let dai;
  let aDai;

  const applicationAmount = '5000000';

  beforeEach(async () => {
    dai = await ERC20token.new('AveTest', 'AT', 18, accounts[0], {
      from: accounts[0],
    });
    aDai = await ADai.new(dai.address, {
      from: accounts[0],
    });
    aaveLendingPool = await AaveLendingPool.new(aDai.address, dai.address, {
      from: accounts[0],
    });
    lendingPoolAddressProvider = await LendingPoolAddressProvider.new(
      aaveLendingPool.address,
      {
        from: accounts[0],
      }
    );

    noLossDao = await NoLossDao.new({ from: accounts[0] });
    //await dai.addMinter(aDai.address, { from: accounts[0] });

    poolDeposits = await PoolDeposits.new(
      dai.address,
      aDai.address,
      lendingPoolAddressProvider.address,
      noLossDao.address,
      applicationAmount,
      { from: accounts[0] }
    );

    await noLossDao.initialize(poolDeposits.address, '1800', {
      from: accounts[0],
    });
  });

  it('NoLossDao:daoRev. Can only redirect interest later. Randoms cannot redirect interest', async () => {
    let mintAmount = '60000000000';

    // Note currently we have hardcoded that the 'interest will be the same as the amount deposited'
    // Therefore a deposit of 60000000000 should yield 60000000000 in interest....

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

 
    await time.increase(time.duration.seconds(1810)); 
    await noLossDao.distributeFunds(); // iteration 0 ends

    await dai.mint(accounts[2], applicationAmount);
    await dai.approve(poolDeposits.address, applicationAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });
    let proposalID1 = 1;

    await noLossDao.voteDirect(proposalID1, { from: accounts[1] });

    await time.increase(time.duration.seconds(1810)); 
    await noLossDao.distributeFunds({ from: accounts[3] }); // iteration 1 ends
    // accounts 3 should get 1% of the interest
    // accounts 0 (admin) should get 13.5% interest
    // winner should get the rest 85.5% interest. 

    let minerBalance = await dai.balanceOf(accounts[3]);
    let adminBalance = await dai.balanceOf(accounts[0]);
    let benefactorBalance = await dai.balanceOf(accounts[2]);

    // 5000000 + 60000000000 should be interest to be split....
    let interestToDistribute = 5000000 + 60000000000;

    assert.equal((interestToDistribute/100).toString(), minerBalance);
    assert.equal((interestToDistribute*135/1000).toString(), adminBalance);
    assert.equal((interestToDistribute*855/1000).toString(), benefactorBalance);
  });
});
