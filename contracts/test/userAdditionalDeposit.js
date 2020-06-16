const {
  BN,
  expectRevert,
  ether,
  expectEvent,
  balance,
  time,
} = require('@openzeppelin/test-helpers');
const { assert } = require('chai');

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

  it('poolDeposits:userAdditionalDepsoit. Cannot add deposit if they have voted an emergency', async () => {
    const mintAmount = '60000000000';
    // deposit
    await dai.mint(accounts[1], new BN(mintAmount).mul(new BN(2)));
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    const allowance = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    expectEvent(logs, 'DepositAdded', {
      user: accounts[1],
      amount: mintAmount,
    });

    const deposit = await poolDeposits.depositedDai.call(accounts[1]);

    await time.increase(time.duration.seconds(8640001)); // 100 days and 1 second - required to `voteEmergency`

    await poolDeposits.voteEmergency({ from: accounts[1] });

    // check that the additional deposit fails.
    await expectRevert(
      poolDeposits.deposit(mintAmount, { from: accounts[1] }),
      'User has emergency voted'
    );

    // User has joined the pool - no changes
    assert.equal(mintAmount, allowance.toString());
    assert.equal(mintAmount, deposit.toString());
  });

  it('poolDeposits:userAdditionalDepsoit. Cannot add additional deposit than their allowance', async () => {
    const mintAmount = new BN('60000000000');
    const doubleMintAmount = mintAmount.mul(new BN(2));
    const initialAllowance = doubleMintAmount.sub(new BN(5));
    // deposit
    await dai.mint(accounts[1], doubleMintAmount);
    // Here, don't mint the full 'doubleMinAmount'
    await dai.approve(poolDeposits.address, initialAllowance, {
      from: accounts[1],
    });
    const allowanceBefore = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    const allowanceAfter = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );
    expectEvent(logs, 'DepositAdded', {
      user: accounts[1],
      amount: mintAmount,
    });

    const deposit = await poolDeposits.depositedDai.call(accounts[1]);

    // check that the additional deposit fails.
    await expectRevert(
      poolDeposits.deposit(mintAmount, { from: accounts[1] }),
      'amount not available'
    );

    // User has joined the pool - no changes
    // assert.equal(, allowance.toString());
    assert.equal(initialAllowance.toString(), allowanceBefore.toString());
    assert.equal(
      initialAllowance.sub(mintAmount).toString(),
      allowanceAfter.toString()
    );
    assert.equal(mintAmount, deposit.toString());
  });

  it('poolDeposits:userAdditionalDepsoit. Cannot add additional deposit more than their balance', async () => {
    const mintAmount = new BN('60000000000');
    const doubleMintAmount = mintAmount.mul(new BN(2));

    // deposit
    await dai.mint(accounts[1], doubleMintAmount.sub(new BN(5)));
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });
    const allowanceBefore = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    const allowanceAfter = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );

    assert.equal(doubleMintAmount.toString(), allowanceBefore.toString());
    assert.equal(mintAmount.toString(), allowanceAfter.toString());
    expectEvent(logs, 'DepositAdded', {
      user: accounts[1],
      amount: mintAmount,
    });

    const deposit = await poolDeposits.depositedDai.call(accounts[1]);

    // check that the additional deposit fails.
    await expectRevert(
      poolDeposits.deposit(mintAmount, { from: accounts[1] }),
      'User does not have enough DAI'
    );

    // User has joined the pool - no changes
    assert.equal(mintAmount, deposit.toString());
  });

  it('poolDeposits:userAdditionalDepsoit. add a test that checks that the user cannot vote after adding deposit.', async () => {
    const mintAmount = new BN('60000000000');
    const doubleMintAmount = mintAmount.mul(new BN(2));

    // someone create a proposal
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    // deposit
    await dai.mint(accounts[1], doubleMintAmount);
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });
    const allowanceBefore = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    const allowanceAfter = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User only eligible to vote next iteration'
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });

    await expectRevert(
      noLossDao.voteDirect(1, { from: accounts[1] }),
      'User only eligible to vote next iteration'
    );

    await time.increase(time.duration.seconds(1801));
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(1, { from: accounts[1] });

    // iteration then proposal ID
    const voteResult = await noLossDao.proposalVotes.call('2', '1');
    assert.equal(voteResult.toString(), doubleMintAmount.toString());

    await time.increase(time.duration.seconds(1801));
    await noLossDao.distributeFunds();

    // check exit amount correct
    await poolDeposits.exit({ from: accounts[1] });
    const afterDai = await dai.balanceOf.call(accounts[1]);
    const afterDeposit = await poolDeposits.depositedDai.call(accounts[1]);

    assert.equal(afterDai.toString(), doubleMintAmount);
    assert.equal(afterDeposit.toString(), '0');
  });

  it('poolDeposits:userAdditionalDepsoit. add a test that checks that the user can add additional deposit after voting.', async () => {
    const mintAmount = new BN('60000000000');
    const doubleMintAmount = mintAmount.mul(new BN(2));
    const projectToVoteFor = '1';

    // someone create a proposal
    await dai.mint(accounts[2], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    // deposit
    await dai.mint(accounts[1], doubleMintAmount);
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });
    const allowanceBefore = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );
    await dai.approve(poolDeposits.address, doubleMintAmount, {
      from: accounts[1],
    });

    const logs = await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });
    const allowanceAfter = await dai.allowance.call(
      accounts[1],
      poolDeposits.address
    );

    await time.increase(time.duration.seconds(1801)); // increment to iteration 1
    await noLossDao.distributeFunds();

    await noLossDao.voteDirect(projectToVoteFor, { from: accounts[1] });

    // iteration then proposal ID
    const proposalIteration = await noLossDao.proposalIteration.call();
    const voteResult = await noLossDao.proposalVotes.call(
      proposalIteration,
      projectToVoteFor
    );
    assert.equal(voteResult.toString(), mintAmount.toString());

    await poolDeposits.deposit(mintAmount, {
      from: accounts[1],
    });

    const finalDeposit = await poolDeposits.depositedDai.call(accounts[1]);

    assert.equal(finalDeposit.toString(), doubleMintAmount.toString());
  });
});
