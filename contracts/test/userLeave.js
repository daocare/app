// const {
//   BN,
//   expectRevert,
//   ether,
//   expectEvent,
//   balance,
//   time,
// } = require('@openzeppelin/test-helpers');

// const NoLossDao = artifacts.require('NoLossDao');
// const AaveLendingPool = artifacts.require('AaveLendingPool');
// const ERC20token = artifacts.require('MockERC20');
// const ADai = artifacts.require('ADai');

// contract('NoLossDao', accounts => {
//   let aaveLendingPool;
//   let noLossDao;
//   let dai;
//   let aDai;

//   const applicationAmount = '5000000';

//   beforeEach(async () => {
//     dai = await ERC20token.new('AveTest', 'AT', 18, accounts[0], {
//       from: accounts[0],
//     });
//     aDai = await ADai.new(dai.address, {
//       from: accounts[0],
//     });
//     aaveLendingPool = await AaveLendingPool.new(aDai.address, {
//       from: accounts[0],
//     });
//     noLossDao = await NoLossDao.new({ from: accounts[0] });
//     await dai.addMinter(aDai.address, { from: accounts[0] });

//     await noLossDao.initialize(
//       dai.address,
//       aDai.address,
//       aaveLendingPool.address,
//       aaveLendingPool.address,
//       applicationAmount,
//       '1800',
//       {
//         from: accounts[0],
//       }
//     );
//   });

//   it('NoLossDao:userLEAVE. User can leave pool', async () => {
//     let mintAmount = '60000000000';
//     // Join in iteration 1
//     await dai.mint(accounts[1], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount, { from: accounts[1] });

//     let beforeDai = await dai.balanceOf.call(accounts[1]);
//     let beforeDeposit = await noLossDao.depositedDai.call(accounts[1]);

//     assert.equal(beforeDai.toString(), '0');
//     assert.equal(beforeDeposit.toString(), mintAmount);

//     // withdraw their funds
//     await noLossDao.withdrawDeposit({ from: accounts[1] });

//     let afterDai = await dai.balanceOf.call(accounts[1]);
//     let afterDeposit = await noLossDao.depositedDai.call(accounts[1]);

//     assert.equal(afterDai.toString(), mintAmount);
//     assert.equal(afterDeposit.toString(), '0');
//   });

//   it('NoLossDao:userLEAVE. User cannot leave pool till new iteration if they have voted', async () => {
//     let mintAmount = '60000000000';

//     // Deposit
//     await dai.mint(accounts[1], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount, { from: accounts[1] });

//     // someone create a proposal
//     await dai.mint(accounts[2], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[2],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[2],
//     });

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 1
//     await noLossDao.distributeFunds();

//     await noLossDao.voteDirect(1, { from: accounts[1] });

//     // withdraw their funds
//     await expectRevert(
//       noLossDao.withdrawDeposit({ from: accounts[1] }),
//       'User already voted this iteration'
//     );

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 2
//     await noLossDao.distributeFunds();

//     await noLossDao.withdrawDeposit({ from: accounts[1] });
//     let afterDai = await dai.balanceOf.call(accounts[1]);
//     let afterDeposit = await noLossDao.depositedDai.call(accounts[1]);

//     assert.equal(afterDai.toString(), mintAmount);
//     assert.equal(afterDeposit.toString(), '0');
//   });

//   it('NoLossDao:userLEAVE. User cannot once already left pool', async () => {
//     let mintAmount = '60000000000';
//     // Join in iteration 1
//     await dai.mint(accounts[1], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount, { from: accounts[1] });

//     // withdraw their funds
//     await noLossDao.withdrawDeposit({ from: accounts[1] });

//     await expectRevert(
//       noLossDao.withdrawDeposit({ from: accounts[1] }),
//       'User has no stake'
//     );
//   });

//   it('NoLossDao:userLEAVE. Someone with a proposal cant call withdraw deposit', async () => {
//     let mintAmount = '60000000000';
//     // Join in iteration 1
//     await dai.mint(accounts[2], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[2],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[2],
//     });

//     await expectRevert(
//       noLossDao.withdrawDeposit({ from: accounts[2] }),
//       'User has a proposal'
//     );
//   });
// });
