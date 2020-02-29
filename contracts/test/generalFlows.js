const {
  BN,
  expectRevert,
  ether,
  expectEvent,
  balance,
  time
} = require("@openzeppelin/test-helpers");

const NoLossDao = artifacts.require("NoLossDao");
const AaveLendingPool = artifacts.require("AaveLendingPool");
const ERC20token = artifacts.require("MockERC20");

contract("WildcardSteward", accounts => {
  let aaveLendingPool;
  let noLossDao;
  let erc20Dai;
  let erc20ADai;

  beforeEach(async () => {
    erc20Dai = await ERC20token.new({
      from: accounts[0]
    });
    erc20ADai = await ERC20token.new({
      from: accounts[0]
    });
    aaveLendingPool = await AaveLendingPool.new(erc20ADai.address, {
      from: accounts[0]
    });
    noLossDao = await NoLossDao.new({ from: accounts[0] });

    await noLossDao.initialize(
      erc20Dai.address,
      erc20ADai.address,
      aaveLendingPool.address,
      "5000000",
      {
        from: accounts[0]
      }
    );
    await erc20Dai.initialize("AveTest", "AT", 18, accounts[0]);
    await erc20ADai.initialize("AveTest", "AT", 18, aaveLendingPool.address);
  });

  it("NoLossDao: deposit - happy path", async () => {
    let mintAmount = "60000000000";
    // deposit
    await erc20Dai.mint(accounts[1], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[1]
    });
    let allowance = await erc20Dai.allowance.call(
      accounts[1],
      noLossDao.address
    );
    await noLossDao.deposit(mintAmount, { from: accounts[1] });

    assert.equal(mintAmount, allowance.toString());
  });

  it("NoLossDao: deposit - should revert if no deposit available", async () => {
    let mintAmount = "60000000000";
    await erc20Dai.mint(accounts[1], mintAmount);

    await expectRevert(
      noLossDao.deposit(mintAmount, { from: accounts[1] }),
      "amount not available"
    );
  });

  it("NoLossDao: createProposal", async () => {
    let mintAmount = "60000000000";

    await erc20Dai.mint(accounts[2], mintAmount);
    await erc20Dai.approve(noLossDao.address, mintAmount, {
      from: accounts[2]
    });
    await noLossDao.createProposal("Some IPFS hash string", {
      from: accounts[2]
    });
    assert.equal(true, true);
  });
});
