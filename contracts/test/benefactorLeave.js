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
//   it('NoLossDao:benefactorLeave. Cannot withdraw proposal as a user ', async () => {
//     let mintAmount = '60000000000';

//     await dai.mint(accounts[1], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount, { from: accounts[1] });

//     await time.increase(time.duration.seconds(1801)); //1
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801)); //2
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801)); //3
//     await noLossDao.distributeFunds();

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[1],
//       }),
//       'User proposal does not exist'
//     );
//   });

//   it('NoLossDao:benefactorLeave. Cannot withdraw proposal as nobody ', async () => {
//     await time.increase(time.duration.seconds(1801));
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801));
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801));
//     await noLossDao.distributeFunds();

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[1],
//       }),
//       'User proposal does not exist'
//     );
//   });

//   it('NoLossDao:benefactorLeave. Benefactor can create a proposal and only withdraw after 3 iterations ', async () => {
//     let mintAmount = '60000000000';

//     await dai.mint(accounts[2], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[2],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[2],
//     });

//     let depositedDaiUser = await noLossDao.depositedDai.call(accounts[2]);
//     let totalDai = await noLossDao.totalDepositedDai.call();

//     assert.equal(applicationAmount, depositedDaiUser.toString());
//     assert.equal(applicationAmount, totalDai);

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[2],
//       }),
//       'Benefactor only eligible to receive funds in later iteration'
//     );

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 1
//     await noLossDao.distributeFunds();

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[2],
//       }),
//       'Benefactor only eligible to receive funds in later iteration'
//     );

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 2
//     await noLossDao.distributeFunds();

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[2],
//       }),
//       'Benefactor only eligible to receive funds in later iteration'
//     );

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 3
//     await noLossDao.distributeFunds();

//     noLossDao.withdrawProposal({
//       from: accounts[2],
//     });

//     // Once withdrawn later
//     let depositedDaiUser2 = await noLossDao.depositedDai.call(accounts[2]);
//     assert.equal('0', depositedDaiUser2.toString());
//   });

//   it('NoLossDao:benefactorLeave. Benefactor create withdraw, create withdraw... ', async () => {
//     let mintAmount = '60000000000';

//     await dai.mint(accounts[2], mintAmount);
//     await dai.approve(noLossDao.address, mintAmount, {
//       from: accounts[2],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[2],
//     });

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 1
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 2
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 3
//     await noLossDao.distributeFunds();

//     noLossDao.withdrawProposal({
//       from: accounts[2],
//     });

//     await noLossDao.createProposal('Some IPFS hash string again', {
//       from: accounts[2],
//     });

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 1
//     await noLossDao.distributeFunds();

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 2
//     await noLossDao.distributeFunds();

//     await expectRevert(
//       noLossDao.withdrawProposal({
//         from: accounts[2],
//       }),
//       'Benefactor only eligible to receive funds in later iteration'
//     );

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 3
//     await noLossDao.distributeFunds();

//     noLossDao.withdrawProposal({
//       from: accounts[2],
//     });
//   });

//   // Check if they create a proposal, withdraw, and recreate in same cycle
//   // Specifically check what happens if they are the top project when withdrawn (if they are winning the vote)

//   // Tests about the benefactor leaving... THESE ARE NB SECURITY
// });
