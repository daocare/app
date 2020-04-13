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

  it('poolDeposits:userJoin. User can join', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    let allowance = await dai.allowance.call(accounts[1], poolDeposits.address);

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    expectEvent(logs, 'DepositAdded', {
      user: accounts[1],
      amount: mintAmount,
    });

    let deposit = await poolDeposits.depositedDai.call(accounts[1]);

    // // User has joined the pool
    assert.equal(mintAmount, allowance.toString());
    assert.equal(mintAmount, deposit.toString());
  });

  it('poolDeposits:userJoin. User cannot join once already in', async () => {
    let mintAmount = '60000000000';
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });

    await poolDeposits.deposit('30000000000', { from: accounts[1] });
    await expectRevert(
      poolDeposits.deposit('30000000000', { from: accounts[1] }),
      'Person is already a user'
    ); // double deposit not allowed
  });

  it('poolDeposits:userJoin. Deposit - should revert if no deposit approved', async () => {
    let mintAmount = '60000000000';
    await dai.mint(accounts[1], mintAmount);

    await expectRevert(
      poolDeposits.deposit(mintAmount, { from: accounts[1] }),
      'amount not available'
    );
  });

  it('poolDeposits:userJoin. Deposit - should revert if user does not have enough DAi', async () => {
    let mintAmount = '60000000000';
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });

    await expectRevert(
      poolDeposits.deposit(mintAmount, { from: accounts[1] }),
      'User does not have enough DAI'
    );
  });

  it('poolDeposits:userJoin. User join iteration correctly displayed', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 1
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });
    await time.increase(time.duration.seconds(1801));

    await noLossDao.distributeFunds();

    // Iteration 2 will only be recorded when payout function is called.
    // Join in iteration 2
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[2] });

    let account1join = await noLossDao.iterationJoined.call(accounts[1]);
    let account2join = await noLossDao.iterationJoined.call(accounts[2]);

    // User has joined the pool
    assert.equal(account1join.toString(), '0');
    assert.equal(account2join.toString(), '1');
  });

  it('poolDeposits:userJoin. Correctly display total DAi deposited after multiple people join', async () => {
    let mintAmount = '60000000000';
    // first person
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });
    // second person
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[2] });
    // third person
    await dai.mint(accounts[3], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[3],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[3] });
    // proposal joined too
    await dai.mint(accounts[4], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[4],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[4],
    });

    let totalExpected = parseInt(mintAmount) * 3 + parseInt(applicationAmount);
    let daiDeposited = await poolDeposits.totalDepositedDai.call();
    assert.equal(daiDeposited.toString(), totalExpected.toString());
  });

  it('poolDeposits:userJoin. If no vote in iteration application does not break', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 0
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    // change iteration 0 ->1
    await time.increase(time.duration.seconds(1801));
    await noLossDao.distributeFunds();

    // Iteration 2 will only be recorded when payout function is called.
    // Join in iteration 2
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[2] });

    // change iteration 1 ->2
    await time.increase(time.duration.seconds(1801));
    await noLossDao.distributeFunds(); // This should fail if no project voted for?
    // Join iteration 3
    await dai.mint(accounts[3], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[3],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[3] });

    let account1join = await noLossDao.iterationJoined.call(accounts[1]);
    let account2join = await noLossDao.iterationJoined.call(accounts[2]);
    let account3join = await noLossDao.iterationJoined.call(accounts[3]);
    // User has joined the pool

    assert.equal(account1join.toString(), '0');
    assert.equal(account2join.toString(), '1');
    assert.equal(account3join.toString(), '2');
  });

  // Add tests to check if users can leave and that they get correct amount....
  // TODO: figure if we deduct gas fees off them for their proxyTwitter votes
});
