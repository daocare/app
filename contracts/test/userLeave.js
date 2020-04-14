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

contract('PoolDeposits', accounts => {
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

  it('poolDeposits:userLEAVE. User can leave pool', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 1
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    let beforeDai = await dai.balanceOf.call(accounts[1]);
    let beforeDeposit = await poolDeposits.depositedDai.call(accounts[1]);

    assert.equal(beforeDai.toString(), '0');
    assert.equal(beforeDeposit.toString(), mintAmount);

    // withdraw their funds
    await poolDeposits.withdrawDeposit({ from: accounts[1] });

    let afterDai = await dai.balanceOf.call(accounts[1]);
    let afterDeposit = await poolDeposits.depositedDai.call(accounts[1]);

    assert.equal(afterDai.toString(), mintAmount);
    assert.equal(afterDeposit.toString(), '0');
  });

  it('poolDeposits:userLEAVE. User cannot leave pool till new iteration if they have voted', async () => {
    let mintAmount = '60000000000';

    // Deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    // someone create a proposal
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    // withdraw their funds
    await expectRevert(
      poolDeposits.withdrawDeposit({ from: accounts[1] }),
      'User already voted this iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    await noLossDao.distributeFunds();

    await poolDeposits.withdrawDeposit({ from: accounts[1] });
    let afterDai = await dai.balanceOf.call(accounts[1]);
    let afterDeposit = await poolDeposits.depositedDai.call(accounts[1]);

    assert.equal(afterDai.toString(), mintAmount);
    assert.equal(afterDeposit.toString(), '0');
  });

  it('poolDeposits:userLEAVE. User cannot once already left pool', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 1
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    // withdraw their funds
    const logs = await poolDeposits.withdrawDeposit({ from: accounts[1] });
    expectEvent(logs, 'DepositWithdrawn', {
      user: accounts[1],
    });

    await expectRevert(
      poolDeposits.withdrawDeposit({ from: accounts[1] }),
      'User has no stake'
    );
  });

  it('poolDeposits:userLEAVE. Someone with a proposal cant call withdraw deposit', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await expectRevert(
      poolDeposits.withdrawDeposit({ from: accounts[2] }),
      'User has a proposal'
    );
  });
});
