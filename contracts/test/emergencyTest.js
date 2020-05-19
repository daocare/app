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

  it('poolDeposits:emergency. Emergency can be declared', async () => {
    let mintAmount1 = '100000000000000000000000';
    let mintAmount2 = '100000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(99));

    await expectRevert(
      poolDeposits.voteEmergency({ from: accounts[2] }),
      'Need to have joined for 100days to vote an emergency'
    );

    await expectRevert(
      poolDeposits.declareStateOfEmergency({ from: accounts[2] }),
      '50% of total pool needs to have voted for emergency state'
    );

    await expectRevert(
      poolDeposits.emergencyWithdraw({ from: accounts[2] }),
      'State of emergency not declared'
    );

    await time.increase(time.duration.days(2));

    await poolDeposits.voteEmergency({ from: accounts[2] });

    const logs = await poolDeposits.declareStateOfEmergency({
      from: accounts[2],
    });

    let created_at = await time.latest();
    let emergencyVoteTotal1 = await poolDeposits.emergencyVoteAmount.call();
    let totalDeposit = await poolDeposits.totalDepositedDai.call();

    expectEvent(logs, 'EmergencyStateReached', {
      user: accounts[2],
      timeStamp: created_at.toString(),
      totalDaiInContract: totalDeposit,
      totalEmergencyVotes: emergencyVoteTotal1,
    });

    await poolDeposits.emergencyWithdraw({ from: accounts[2] });
    await poolDeposits.emergencyWithdraw({ from: accounts[1] });
  });

  it('poolDeposits:emergency. Cannot deposit or create proposal once emergency declared', async () => {
    let mintAmount1 = '100000000000000000000000';
    let mintAmount2 = '100000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(101));

    const logs = await poolDeposits.voteEmergency({ from: accounts[2] });
    expectEvent(logs, 'EmergencyVote', {
      user: accounts[2],
      emergencyVoteAmount: mintAmount2,
    });

    await poolDeposits.declareStateOfEmergency({ from: accounts[5] });

    await dai.mint(accounts[3], mintAmount2);
    await dai.approve(poolDeposits.address, mintAmount2, {
      from: accounts[3],
    });
    await expectRevert(
      poolDeposits.deposit(mintAmount2, { from: accounts[3] }),
      'State of emergency declared'
    );

    await expectRevert(
      poolDeposits.createProposal('some hash', { from: accounts[3] }),
      'State of emergency declared'
    );

    await poolDeposits.emergencyWithdraw({ from: accounts[2] });
    await poolDeposits.emergencyWithdraw({ from: accounts[1] });
  });

  it('poolDeposits:emergency. Cannot declare emergency without majority', async () => {
    let mintAmount1 = '100000000000000000000000';
    let mintAmount2 = '100000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(101));

    await poolDeposits.voteEmergency({ from: accounts[1] });
    await expectRevert(
      poolDeposits.declareStateOfEmergency({ from: accounts[1] }),
      '50% of total pool needs to have voted for emergency state'
    );

    await expectRevert(
      poolDeposits.emergencyWithdraw({ from: accounts[1] }),
      'State of emergency not declared'
    );

    await poolDeposits.voteEmergency({ from: accounts[2] });
    await poolDeposits.declareStateOfEmergency({
      from: accounts[2],
    });
    const logs = await poolDeposits.emergencyWithdraw({
      from: accounts[2],
    });
    expectEvent(logs, 'EmergencyWithdrawl', {
      user: accounts[2],
    });
  });

  it('poolDeposits:emergency. Cannot declare emergency without 200 000DAI pool', async () => {
    let mintAmount1 = '50000000000000000000000';
    let mintAmount2 = '50000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(101));

    await poolDeposits.voteEmergency({ from: accounts[1] });
    await poolDeposits.voteEmergency({ from: accounts[2] });

    await expectRevert(
      poolDeposits.declareStateOfEmergency({ from: accounts[1] }),
      '200 000DAI required in pool before emergency state can be declared'
    );
  });

  it('poolDeposits:emergency. EmergencyVotes tally correct', async () => {
    let mintAmount1 = '50000000000000000000000';
    let mintAmount2 = '50000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(101));

    await poolDeposits.voteEmergency({ from: accounts[1] });
    let emergencyVoteTotal1 = await poolDeposits.emergencyVoteAmount.call();
    await poolDeposits.voteEmergency({ from: accounts[2] });
    let emergencyVoteTotal2 = await poolDeposits.emergencyVoteAmount.call();

    assert(emergencyVoteTotal1.toString(), mintAmount1);
    assert(
      emergencyVoteTotal2.toString(),
      (parseInt(mintAmount1) + parseInt(mintAmount2)).toString()
    );

    const logs = await poolDeposits.withdrawDeposit({ from: accounts[1] });
    expectEvent(logs, 'RemoveEmergencyVote', {
      user: accounts[1],
      emergencyVoteAmount: mintAmount1,
    });

    let emergencyVoteTotal3 = await poolDeposits.emergencyVoteAmount.call();
    assert(emergencyVoteTotal3.toString(), mintAmount2);

    await dai.approve(poolDeposits.address, mintAmount1, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount1, { from: accounts[1] });
    await expectRevert(
      poolDeposits.voteEmergency({ from: accounts[1] }),
      'Need to have joined for 100days to vote an emergency'
    );
    await time.increase(time.duration.days(101));
    await poolDeposits.voteEmergency({ from: accounts[1] });
  });

  it('poolDeposits:emergency. Cannot emergency vote twice', async () => {
    let mintAmount1 = '50000000000000000000000';
    let mintAmount2 = '50000000000000000000001';
    // deposit
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

    await time.increase(time.duration.days(101));

    await poolDeposits.voteEmergency({ from: accounts[1] });

    await expectRevert(
      poolDeposits.voteEmergency({ from: accounts[1] }),
      'Already voted for emergency'
    );
  });
});
