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

  it('NoLossDao: benefactor can create a proposal', async () => {
    let mintAmount = '60000000000';

    await erc20Dai.mint(accounts[2], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    let depositedDaiUser = await noLossDao.depositedDai.call(accounts[2]);

    assert.equal(applicationAmount, depositedDaiUser.toString());
    assert.equal(true, true); // lol
  });

  it('NoLossDao: benefactor cannot create a proposal if they are a user', async () => {
    let mintAmount = '60000000000';

    await erc20Dai.mint(accounts[2], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2],
    });
    await noLossDao.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });

    // await erc20Dai.mint(accounts[3], mintAmount);
    // await erc20Dai.approve(noLossDao.address, mintAmount, {
    //   from: accounts[3],
    // });
    // await noLossDao.createProposal('Some IPFS hash string', {
    //   from: accounts[3],
    // });

    let totalDepositedDai = await noLossDao.totalDepositedDai.call();
    let depositedDaiUser = await noLossDao.depositedDai.call(accounts[2]);

    assert.equal(applicationAmount, totalDepositedDai.toString());
    assert.equal(applicationAmount, depositedDaiUser.toString());
    assert.equal(true, true);
  });

  // Tests about the benefactor leaving...
});
