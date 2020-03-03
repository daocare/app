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

contract('NoLossDao', accounts => {
  let aaveLendingPool;
  let noLossDao;
  let erc20Dai;
  let erc20ADai;

  const applicationAmount = '5000000';

  beforeEach(async () => {
    erc20Dai = await ERC20token.new({
      from: accounts[0],
    });
    erc20ADai = await ERC20token.new({
      from: accounts[0],
    });
    aaveLendingPool = await AaveLendingPool.new(erc20ADai.address, {
      from: accounts[0],
    });
    noLossDao = await NoLossDao.new({ from: accounts[0] });

    await noLossDao.initialize(
      erc20Dai.address,
      erc20ADai.address,
      aaveLendingPool.address,
      aaveLendingPool.address,
      applicationAmount,
      '1800',
      {
        from: accounts[0],
      }
    );
    await erc20Dai.initialize('AveTest', 'AT', 18, accounts[0]);
    await erc20ADai.initialize('AveTest', 'AT', 18, aaveLendingPool.address);
  });

  it('NoLossDao: user can join', async () => {
    let mintAmount = '60000000000';
    // deposit
    await erc20Dai.mint(accounts[1], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    let allowance = await erc20Dai.allowance.call(
      accounts[1],
      noLossDao.address
    );

    await noLossDao.deposit(mintAmount, { from: accounts[1] });
    let deposit = await noLossDao.depositedDai.call(accounts[1]);

    // User has joined the pool
    assert.equal(mintAmount, allowance.toString());
    assert.equal(mintAmount, deposit.toString());
  });

  it('NoLossDao: user cannot join once already in', async () => {
    let mintAmount = '60000000000';
    await erc20Dai.mint(accounts[1], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });

    await noLossDao.deposit('30000000000', { from: accounts[1] });
    await expectRevert(
      noLossDao.deposit('30000000000', { from: accounts[1] }),
      'Person is already a user'
    ); // double deposit not allowed
  });

  it('NoLossDao: deposit - should revert if no deposit available', async () => {
    let mintAmount = '60000000000';
    await erc20Dai.mint(accounts[1], mintAmount);

    await expectRevert(
      noLossDao.deposit(mintAmount, { from: accounts[1] }),
      'amount not available'
    );
  });

  it('NoLossDao:userJoinLeave. deposit - should revert if user doesnt have enough DAi', async () => {
    let mintAmount = '60000000000';
    // await erc20Dai.mint(accounts[1], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });

    await expectRevert(
      noLossDao.deposit(mintAmount, { from: accounts[1] }),
      'User does not have enough DAI'
    );
  });

  // Add tests to check if users can leave and that they get correct amount....
  // TODO: figure if we deduct gas fees off them for their proxyTwitter votes
});
