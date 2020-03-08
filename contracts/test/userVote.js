const {
  BN,
  expectRevert,
  ether,
  expectEvent,
  balance,
  time,
} = require('@openzeppelin/test-helpers');

const NoLossDao = artifacts.require('NoLossDao');
const AaveLendingPool = artifacts.require('AaveLendingPool');
const ERC20token = artifacts.require('MockERC20');
const ADai = artifacts.require('ADai');

contract('NoLossDao', accounts => {
  let aaveLendingPool;
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
    await noLossDao.initialize(
      dai.address,
      aDai.address,
      aaveLendingPool.address,
      aaveLendingPool.address,
      applicationAmount,
      '1800',
      {
        from: accounts[0],
      }
    );
  });

  it('NoLossDao:userVote. User cannot vote immediately after joining.', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User only eligible to vote next iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    let deposit = await noLossDao.depositedDai.call(accounts[1]);
    let iteration = await noLossDao.proposalIteration.call();
    let votesForProposal = await noLossDao.proposalVotes.call(iteration, 1); // calling with two parameters? Check its this way arounf

    // User has joined the pool
    assert.equal(mintAmount, votesForProposal.toString());
    assert.equal(mintAmount, deposit.toString());
  });

  it('NoLossDao:userVote. User cannot vote if proposal does not exist', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
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

  it('NoLossDao:userVote. User cannot vote if they have not deposited', async () => {
    let mintAmount = '60000000000';
    // deposit

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });
    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User has no stake'
    );
  });

  it('NoLossDao:userVote. User cannot vote twice in one iteration.', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await dai.mint(accounts[3], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[3],
    });
    await noLossDao.createProposal('Some IPFS hash string2', {
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

  it('NoLossDao:userVote. User cannot join, withdraw then vote.', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.withdrawDeposit({ from: accounts[1] });
    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User has no stake'
    );
  });

  it('NoLossDao:userVote. User cannot withdraw same iteration after voting', async () => {
    let mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    // Proposal ID will be 1
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    await expectRevert(
      noLossDao.withdrawDeposit({ from: accounts[1] }),
      'User already voted this iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await expectRevert(
      noLossDao.withdrawDeposit({ from: accounts[1] }),
      'User already voted this iteration'
    );
    await noLossDao.distributeFunds();

    await noLossDao.withdrawDeposit({ from: accounts[1] });
  });
});
