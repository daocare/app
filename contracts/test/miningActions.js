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

contract('noLossDao', accounts => {
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

  it('NoLossDao:distributeFunds. Can only mine next iteration.', async () => {
    let mintAmount = '60000000000';

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

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await time.increase(time.duration.seconds(1790)); // increment to iteration 1
    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );
    await time.increase(time.duration.seconds(12));
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    await time.increase(time.duration.seconds(500));

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    await time.increase(time.duration.seconds(1000));

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    await time.increase(time.duration.seconds(2000));
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    await time.increase(time.duration.seconds(1801));
    await noLossDao.distributeFunds();

    await time.increase(time.duration.seconds(1799));

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );
  });

  it('NoLossDao:distributeFunds. Can change interval time.', async () => {
    let mintAmount = '60000000000';

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

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await time.increase(time.duration.seconds(1780)); // increment to iteration 1
    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );
    await time.increase(time.duration.seconds(30));
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.changeVotingInterval(900, { from: accounts[1] }),
      'Not admin'
    );
    await noLossDao.changeVotingInterval(900, { from: accounts[0] });

    await time.increase(time.duration.seconds(1805)); // increment to iteration 1
    // Now interval will only be 900 seconds.....
    await noLossDao.distributeFunds();

    await time.increase(time.duration.seconds(895)); // increment to iteration 1
    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    await time.increase(time.duration.seconds(10));
    await noLossDao.distributeFunds();
  });
});
