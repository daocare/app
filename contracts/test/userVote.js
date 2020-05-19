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

  it('noLossDao:userVote. User cannot vote immediately after joining.', async () => {
    let mintAmount = '60000000000';
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

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User only eligible to vote next iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    let deposit = await poolDeposits.depositedDai.call(accounts[1]);
    let iteration = await noLossDao.proposalIteration.call();
    let votesForProposal = await noLossDao.proposalVotes.call(iteration, 1); // calling with two parameters? Check its this way arounf

    // User has joined the pool
    assert.equal(mintAmount, votesForProposal.toString());
    assert.equal(mintAmount, deposit.toString());
  });

  it('noLossDao:userVote. Only deposit contract can call functions certain functions in NoLossDao.', async () => {
    await expectRevert(
      noLossDao.noLossDeposit(accounts[1], { from: accounts[1] }),
      'function can only be called by deposit contract'
    );

    await expectRevert(
      noLossDao.noLossWithdraw(accounts[1], { from: accounts[1] }),
      'function can only be called by deposit contract'
    );
  });

  it('noLossDao:userVote. User cannot vote if proposal does not exist', async () => {
    let mintAmount = '60000000000';
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
    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.voteDirect(2, { from: accounts[1] }),
      'Proposal is not active'
    );

    await expectRevert(
      noLossDao.voteDirect(0, { from: accounts[1] }),
      'Proposal is not active'
    );
  });

  it('noLossDao:userVote. User cannot vote if they have not deposited', async () => {
    let mintAmount = '60000000000';
    // deposit

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });
    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User has no stake'
    );
  });

  it('noLossDao:userVote. User cannot vote twice in one iteration.', async () => {
    let mintAmount = '60000000000';
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

    await dai.mint(accounts[3], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[3],
    });
    await poolDeposits.createProposal('Some IPFS hash string2', {
      from: accounts[3],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });
    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User already voted this iteration'
    );
    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(2, { from: accounts[1] }); // other is in cooldown
  });

  it('noLossDao:userVote. User cannot join, withdraw then vote.', async () => {
    let mintAmount = '60000000000';
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

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await poolDeposits.withdrawDeposit({ from: accounts[1] });
    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User has no stake'
    );
  });

  it('noLossDao:userVote. User cannot withdraw same iteration after voting', async () => {
    let mintAmount = '60000000000';
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

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    await expectRevert(
      poolDeposits.withdrawDeposit({ from: accounts[1] }),
      'User already voted this iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await expectRevert(
      poolDeposits.withdrawDeposit({ from: accounts[1] }),
      'User already voted this iteration'
    );
    await noLossDao.distributeFunds();

    await poolDeposits.withdrawDeposit({ from: accounts[1] });
  });
});
