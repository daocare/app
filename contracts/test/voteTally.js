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
    dai = await ERC20token.new('DaiTest', 'DT', 18, accounts[0], {
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

  it('noLossDao:voteTally. Votes tally gets correctly registered.', async () => {
    let mintAmount1 = '60000000000';
    let mintAmount2 = '70000000000';
    //////////// ITERATION 0 /////////////////
    // Creater voters account 1 (vote power =6) and 2 (vote power=7)
    await dai.mint(accounts[1], mintAmount1);
    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount1, { from: accounts[1] });
    await dai.mint(accounts[2], mintAmount2);
    await dai.approve(poolDeposits.address, mintAmount2, {
      from: accounts[2],
    });
    await poolDeposits.deposit(mintAmount2, { from: accounts[2] });

    // Creat proposals ID 1 and 2 (from accounts 3 and 4)
    await dai.mint(accounts[3], mintAmount1);
    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[3],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[3],
    });
    let proposalID1 = 1;

    await dai.mint(accounts[4], mintAmount1);
    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[4],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[4],
    });
    let proposalID2 = 2;

    await dai.mint(accounts[9], mintAmount1);
    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[9],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[9],
    });
    let proposalID3 = 3;

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();
    //////////// ITERATION 1 /////////////////

    await noLossDao.voteDirect(proposalID1, { from: accounts[1] });
    await noLossDao.voteDirect(proposalID2, { from: accounts[2] }); // this proposal should win

    let votesForProposal1 = await noLossDao.proposalVotes.call(
      '1',
      proposalID1
    );
    let votesForProposal2 = await noLossDao.proposalVotes.call(
      '1',
      proposalID2
    );
    assert.equal(mintAmount1, votesForProposal1.toString());
    assert.equal(mintAmount2, votesForProposal2.toString());

    // Create 3rd voting user (account 5) vote power = 6
    await dai.mint(accounts[5], mintAmount1);
    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[5],
    });
    await poolDeposits.deposit(mintAmount1, { from: accounts[5] });

    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    let currentIteration = await noLossDao.proposalIteration.call();
    const iterationLogs = await noLossDao.distributeFunds({
      from: accounts[5],
    }); //check who winner was
    let created_at = await time.latest();
    expectEvent(iterationLogs, 'IterationChanged', {
      timeStamp: created_at,
      miner: accounts[5],
    });
    expectEvent(iterationLogs, 'IterationWinner', {
      propsalIteration: currentIteration,
      winner: accounts[4],
      projectId: '2',
    });

    //////////// ITERATION 2 /////////////////

    let winner = await noLossDao.topProject.call('1'); // winner of first iteration
    assert.equal(proposalID2, winner.toString());

    await noLossDao.voteDirect(proposalID1, { from: accounts[1] }); // 1 gets 6 votes
    await noLossDao.voteDirect(proposalID3, { from: accounts[2] }); // 3 gets 7 votes
    await noLossDao.voteDirect(proposalID1, { from: accounts[5] }); // 1 gets another 6 votes
    // Proposal 1 should win

    await time.increase(time.duration.seconds(1801)); // increment to iteration 2
    await noLossDao.distributeFunds(); //check who winner was
    //////////// ITERATION 3 /////////////////

    let nextWinner = await noLossDao.topProject.call('2'); //iteration 2

    let votesForProposal1NextIteration = await noLossDao.proposalVotes.call(
      '2',
      proposalID1
    );
    let votesForProposal2NextIteration = await noLossDao.proposalVotes.call(
      '2',
      proposalID3
    );

    assert.equal(
      votesForProposal1NextIteration.toString(),
      (parseInt(mintAmount1) * 2).toString()
    );
    assert.equal(votesForProposal2NextIteration.toString(), mintAmount2);
    assert.equal(proposalID1, nextWinner.toString());
  });
});
