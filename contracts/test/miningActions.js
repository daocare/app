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

//   it('NoLossDao:miningActions. Can only mine next iteration.', async () => {
//     let mintAmount = '60000000000';

//     await expectRevert(
//       noLossDao.distributeFunds(),
//       'iteration interval not ended'
//     );

//     // deposit
//     await dai.mint(accounts[1], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount, { from: accounts[1] });

//     // Proposal ID will be 1
//     await dai.mint(accounts[2], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[2],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[2],
//     });

//     await time.increase(time.duration.seconds(1799)); // increment to iteration 1
//     await expectRevert(
//       noLossDao.distributeFunds(),
//       'iteration interval not ended'
//     );
//     await time.increase(time.duration.seconds(2));
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(2000));
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801));
//     await noLossDao.distributeFunds();
//   });
// });
