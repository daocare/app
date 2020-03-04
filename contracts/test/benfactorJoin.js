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
    await aDai.addMinter(aaveLendingPool.address);
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

  it('NoLossDao:benefactorJoin. Benefactor can create a proposal. This deposit is reflected in all variables.', async () => {
    let mintAmount = '60000000000';

    await dai.mint(accounts[2], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    let depositedDaiUser = await noLossDao.depositedDai.call(accounts[2]);
    let totalDai = await noLossDao.totalDepositedDai.call();

    assert.equal(applicationAmount, depositedDaiUser.toString());
    assert.equal(applicationAmount, totalDai);
    assert.equal(true, true); // lol
  });

  it('NoLossDao:benefactorJoin. Benefactor cannot create a proposal if they are a user', async () => {
    let mintAmount = '90000000000';
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit('30000000000', { from: accounts[1] });

    await expectRevert(
      noLossDao.createProposal('Some IPFS hash string', {
        from: accounts[1],
      }),
      'Person is already a user'
    );
  });

  it('NoLossDao:benefactorJoin. Benefactor cannot create a proposal if they already have an active proposal', async () => {
    let mintAmount = '90000000000';
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.createProposal('Some IPFS hash string project 1', {
      from: accounts[1],
    });

    await expectRevert(
      noLossDao.createProposal('Some IPFS hash string project 2', {
        from: accounts[1],
      }),
      'User has an active proposal'
    );
  });

  it('NoLossDao:benefactorJoin. Benefactor has not approved enough dai to join', async () => {
    let mintAmount = '600000000';
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(noLossDao.address, '4900000', {
      from: accounts[1],
    });
    await expectRevert(
      noLossDao.createProposal('Some IPFS hash string project 1', {
        from: accounts[1],
      }),
      'amount not available'
    );
  });

  it('NoLossDao:benefactorJoin. Benefactor does not have enough dai to join', async () => {
    await dai.mint(accounts[1], '4900000');
    await dai.approve(noLossDao.address, '600000000', {
      from: accounts[1],
    });
    await expectRevert(
      noLossDao.createProposal('Some IPFS hash string project 1', {
        from: accounts[1],
      }),
      'User does not have enough DAI'
    );
  });

  // Check if they create a proposal, withdraw, and recreate in same cycle
  // Specifically check what happens if they are the top project when withdrawn (if they are winning the vote)

  // Tests about the benefactor leaving... THESE ARE NB SECURITY
});
