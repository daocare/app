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

  it('NoLossDao:daoRev. interest earned is split correctly', async () => {
    let mintAmount = '60000000000';

    // Note currently we have hardcoded that the 'interest will be the same as the amount deposited'
    // Therefore a deposit of 60000000000 should yield 60000000000 in interest....

    await expectRevert(
      noLossDao.distributeFunds(),
      'iteration interval not ended'
    );

    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    await time.increase(time.duration.seconds(1810));
    await noLossDao.distributeFunds(); // iteration 0 ends

    await dai.mint(accounts[2], applicationAmount);
    await dai.approve(poolDeposits.address, applicationAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });
    let proposalID1 = 1;

    await noLossDao.voteDirect(proposalID1, { from: accounts[1] });

    await time.increase(time.duration.seconds(1810));
    await noLossDao.distributeFunds(); // iteration 1 ends

    await time.increase(time.duration.seconds(1810)); //iteration 2 ends
    await noLossDao.distributeFunds({ from: accounts[3] });

    // accounts 3 should get 1.5% of the interest
    // accounts 0 (admin) should get 13.5% interest
    // winner should get the rest 85% interest.

    let minerBalance = await dai.balanceOf(accounts[3]);
    let adminBalance = await dai.balanceOf(accounts[0]);
    let benefactorBalance = await dai.balanceOf(accounts[2]);

    // 5000000 + 60000000000 should be interest to be split....
    let interestToDistribute = 5000000 + 60000000000;

    assert.equal(
      ((interestToDistribute * 15) / 1000).toString(),
      minerBalance.toString()
    );
    assert.equal(
      ((interestToDistribute * 135) / 1000).toString(),
      adminBalance.toString()
    );
    assert.equal(
      ((interestToDistribute * 850) / 1000).toString(),
      benefactorBalance.toString()
    );
  });

  it('NoLossDao:daoRev. Can set interest recievers', async () => {
    let mintAmount = '60000000000';

    // Note currently we have hardcoded that the 'interest will be the same as the amount deposited'
    // Therefore a deposit of 60000000000 should yield 60000000000 in interest....
    let addresses = [accounts[7], accounts[8], accounts[9]];
    let percentages = [50, 200, 300];
    let percentagesError = [12, 10];
    let percentagesError2 = [12, 10, 980];

    await expectRevert(
      noLossDao.setInterestReceivers(addresses, percentages, {
        from: accounts[1],
      }),
      'Not admin'
    );

    await expectRevert(
      poolDeposits.distributeInterest(addresses, percentages, accounts[2], 1, {
        from: accounts[2],
      }),
      'function can only be called by no Loss Dao contract'
    );

    await expectRevert(
      poolDeposits.distributeInterest(
        addresses,
        percentagesError,
        accounts[2],
        1,
        {
          from: accounts[2],
        }
      ),
      'Input length not equal'
    );

    await expectRevert(
      noLossDao.setInterestReceivers(addresses, percentagesError, {
        from: accounts[0],
      }),
      'Arrays should be equal length'
    );
    await expectRevert(
      noLossDao.setInterestReceivers(addresses, percentagesError2, {
        from: accounts[0],
      }),
      'Percentages total too high'
    );

    const logs = await noLossDao.setInterestReceivers(addresses, percentages, {
      from: accounts[0],
    });

    // How do you check arrays
    // expectEvent(logs, 'InterestConfigChanged', {
    //   addresses: addresses,
    //   percentages: percentages,
    //   iteration: 0,
    // });

    // deposit
    await dai.mint(accounts[1], mintAmount);
    await dai.approve(poolDeposits.address, mintAmount, {
      from: accounts[1],
    });
    await poolDeposits.deposit(mintAmount, { from: accounts[1] });

    await time.increase(time.duration.seconds(1810));
    await noLossDao.distributeFunds(); // iteration 0 ends

    await dai.mint(accounts[2], applicationAmount);
    await dai.approve(poolDeposits.address, applicationAmount, {
      from: accounts[2],
    });
    await poolDeposits.createProposal('Some IPFS hash string', {
      from: accounts[2],
    });
    let proposalID1 = 1;

    await noLossDao.voteDirect(proposalID1, { from: accounts[1] });

    await time.increase(time.duration.seconds(1810));
    await noLossDao.distributeFunds(); // iteration 1 ends

    await time.increase(time.duration.seconds(1810)); //iteration 2 ends
    await noLossDao.distributeFunds({ from: accounts[3] });

    // accounts 3 should get 1.5% of the interest
    // accounts 0 (admin) should get 13.5% interest
    // winner should get the rest 85% interest.

    let minerBalance = await dai.balanceOf(accounts[3]);
    let accounts8 = await dai.balanceOf(accounts[8]);
    let accounts9 = await dai.balanceOf(accounts[9]);
    let benefactorBalance = await dai.balanceOf(accounts[2]);

    // 5000000 + 60000000000 should be interest to be split....
    let interestToDistribute = 5000000 + 60000000000;

    assert.equal(
      ((interestToDistribute * 50) / 1000).toString(),
      minerBalance.toString()
    );
    assert.equal(
      ((interestToDistribute * 200) / 1000).toString(),
      accounts8.toString()
    );
    assert.equal(
      ((interestToDistribute * 300) / 1000).toString(),
      accounts9.toString()
    );
    assert.equal(
      ((interestToDistribute * 450) / 1000).toString(),
      benefactorBalance.toString()
    );
  });
});
