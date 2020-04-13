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

  it('noLossDao:voteProxy. User can delegate vote and proxy can vote on behalf.', async () => {
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

    // Proposal ID will be 2
    await dai.mint(accounts[9], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[9],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[9],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    // Can delegate vote
    const delegate = await noLossDao.delegateVoting(accounts[3], {
      from: accounts[1],
    });

    expectEvent(delegate, 'VoteDelegated', {
      user: accounts[1],
      delegatedTo: accounts[3],
    });
    let currentIteration = await noLossDao.proposalIteration.call();
    // Proxy can vote then user cannot
    const voted = await noLossDao.voteProxy(1, accounts[1], {
      from: accounts[3],
    });
    expectEvent(voted, 'VotedViaProxy', {
      proxy: accounts[3],
      user: accounts[1],
      iteration: currentIteration,
      proposalId: '1',
    });

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User already voted this iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    await noLossDao.distributeFunds();

    // User can vote before proxy
    await noLossDao.voteDirect(2, { from: accounts[1] });
    await expectRevert(
      noLossDao.voteProxy(2, accounts[1], { from: accounts[3] }),
      'User already voted this iteration'
    );
  });

  it('noLossDao:voteProxy. Random can not proxy vote on anothers behalf.', async () => {
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

    // Proxy can vote then user cannot
    await expectRevert(
      noLossDao.voteProxy(1, accounts[1], { from: accounts[3] }),
      'User does not have proxy right'
    );
  });

  //   //   Weird behaviour. This sometimes fails. Its not deterministic...
  //   //   setting proxy back to yourself -> await noLossDao.delegateVoting(accounts[1], { from: accounts[1] });
  // THink this was because I forgot an await infront of one function. Solved now hopefully
  it('noLossDao:voteProxy. Proxy vote can be set back to only user.', async () => {
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

    // Proposal ID will be 2
    await dai.mint(accounts[9], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[9],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[9],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.delegateVoting(accounts[3], { from: accounts[1] });
    await noLossDao.voteProxy(1, accounts[1], { from: accounts[3] });

    // proxy can no longer vote on your behalf
    await noLossDao.delegateVoting(accounts[1], { from: accounts[1] });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.voteProxy(2, accounts[1], { from: accounts[3] }),
      'User does not have proxy right'
    );
    const voteDirectEvent = await noLossDao.voteDirect(2, {
      from: accounts[1],
    });
    let currentIteration = await noLossDao.proposalIteration.call();
    expectEvent(voteDirectEvent, 'VotedDirect', {
      user: accounts[1],
      iteration: currentIteration,
      proposalId: '2',
    });

    await expectRevert(
      noLossDao.voteProxy(2, accounts[1], { from: accounts[1] }),
      'User already voted this iteration'
    );
  });

  it('noLossDao:voteProxy. User can Proxy multiple times.', async () => {
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

    await noLossDao.delegateVoting(accounts[3], { from: accounts[1] });
    await noLossDao.delegateVoting(accounts[4], { from: accounts[1] });
    await noLossDao.delegateVoting(accounts[5], { from: accounts[1] });

    await expectRevert(
      noLossDao.voteProxy(1, accounts[1], { from: accounts[3] }),
      'User does not have proxy right'
    );

    await expectRevert(
      noLossDao.voteProxy(1, accounts[1], { from: accounts[4] }),
      'User does not have proxy right'
    );
    noLossDao.voteProxy(1, accounts[1], { from: accounts[5] });
  });

  it('noLossDao:voteProxy. Users proxy each other', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[2] });

    // Proposal ID will be 1
    await dai.mint(accounts[3], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[3],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[3],
    });

    // Can delegate to each other
    await noLossDao.delegateVoting(accounts[2], { from: accounts[1] });
    await noLossDao.delegateVoting(accounts[1], { from: accounts[2] });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    noLossDao.voteProxy(1, accounts[1], { from: accounts[2] });
    noLossDao.voteProxy(1, accounts[2], { from: accounts[1] });
    await expectRevert(
      noLossDao.voteProxy(1, accounts[2], { from: accounts[1] }),
      'User already voted this iteration'
    );
    // Cannot delegate to a benefactor
    await expectRevert(
      noLossDao.delegateVoting(accounts[3], { from: accounts[2] }),
      'User has an active proposal'
    );
  });
});
