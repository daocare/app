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
const ERC20token = artifacts.require('MockERC20');
const ADai = artifacts.require('ADai');

contract('noLossDao', accounts => {
  let aaveLendingPool;
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
    aaveLendingPool = await AaveLendingPool.new(aDai.address, {
      from: accounts[0],
    });
    noLossDao = await NoLossDao.new({ from: accounts[0] });
    await dai.addMinter(aDai.address, { from: accounts[0] });

    poolDeposits = await PoolDeposits.new(
      dai.address,
      aDai.address,
      aaveLendingPool.address,
      aaveLendingPool.address,
      noLossDao.address,
      applicationAmount,
      { from: accounts[0] }
    );

    await noLossDao.initialize(poolDeposits.address, '604800', {
      from: accounts[0],
    });
  });

  it('NoLossDao:daoRev. Can only redirect interest later. Randoms cannot redirect interest', async () => {
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

    // Note 604800 is 7 days exactly. The iteration length in this case
    await time.increase(time.duration.seconds(604799)); // increment to iteration 1
    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );
    await time.increase(time.duration.seconds(2));
    await noLossDao.distributeFunds();

    // This should fail
    await expectRevert(
      poolDeposits.redirectInterestStreamToWinner(accounts[9], { from: accounts[9] }),
      'function can only be called by no Loss Dao contract'
    );

    await expectRevert(
      noLossDao.daoCareFunding(accounts[9], { from: accounts[0] }),
      'Not yet eligible to redirect interest stream'
    );

    // 518400 seconds is 6 days exactly. After 6 days we should be allowed to redirect interest
    await time.increase(time.duration.seconds(518395));

    await expectRevert(
      noLossDao.daoCareFunding(accounts[9], { from: accounts[1] }),
      'Not admin'
    );

    await expectRevert(
      noLossDao.daoCareFunding(accounts[9], { from: accounts[0] }),
      'Not yet eligible to redirect interest stream'
    );

    await time.increase(time.duration.seconds(10));

    // THese should all pass as we've reached 6/7 of the iteration and until the new iteration is called,
    // We would be able to redirect the interest stream
    await noLossDao.daoCareFunding(accounts[9], { from: accounts[0] });

    await time.increase(time.duration.seconds(518402));
    await noLossDao.daoCareFunding(accounts[9], { from: accounts[0] });

    await time.increase(time.duration.seconds(518402));
    await noLossDao.daoCareFunding(accounts[9], { from: accounts[0] });

    await noLossDao.distributeFunds();

    // This should fail as iteration has just ended (line above), yet we can redirect it already
    // This is where its expecting a revert but none received
    await expectRevert(
      noLossDao.daoCareFunding(accounts[9], { from: accounts[0] }),
      'Not yet eligible to redirect interest stream'
    );
  });
});
