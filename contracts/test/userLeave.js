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

  it('NoLossDao:userJoin. User can leave pool', async () => {
    let mintAmount = '60000000000';
    // Join in iteration 1
    await erc20Dai.mint(accounts[1], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1],
    });
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    //await time.increase(time.duration.seconds(1801)); // when can they leave?
    //await noLossDao.distributeFunds();

    let beforeDai = await erc20Dai.balanceOf.call(accounts[1]);
    let beforeDeposit = await noLossDao.depositedDai.call(accounts[1]);

    assert.equal(beforeDai.toString(), '0');
    assert.equal(beforeDeposit.toString(), mintAmount);

    // withdraw their funds
    await noLossDao.withdrawDeposit({ from: accounts[1] });

    let afterDai = await erc20Dai.balanceOf.call(accounts[1]);
    let afterDeposit = await noLossDao.depositedDai.call(accounts[1]);

    assert.equal(afterDai.toString(), mintAmount);
    assert.equal(afterDeposit.toString(), '0');
  });
});
