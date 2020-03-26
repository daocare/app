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

//   it('NoLossDao:voteTally. Votes tally gets correctly registered.', async () => {
//     let mintAmount1 = '60000000000';
//     let mintAmount2 = '70000000000';
//     //////////// ITERATION 0 /////////////////
//     // Creater voters account 1 (vote power =6) and 2 (vote power=7)
//     await dai.mint(accounts[1], mintAmount1);
//     await dai.approve(noLossDao.address, mintAmount1, {
//       from: accounts[1],
//     });
//     await noLossDao.deposit(mintAmount1, { from: accounts[1] });
//     await dai.mint(accounts[2], mintAmount2);
//     await dai.approve(noLossDao.address, mintAmount2, {
//       from: accounts[2],
//     });
//     await noLossDao.deposit(mintAmount2, { from: accounts[2] });

//     // Creat proposals ID 1 and 2 (from accounts 3 and 4)
//     await dai.mint(accounts[3], mintAmount1);
//     await dai.approve(noLossDao.address, mintAmount1, {
//       from: accounts[3],
//     });
//     await noLossDao.createProposal('Some IPFS hash string', {
//       from: accounts[3],
//     });
//     let proposalID1 = 1;

//     await dai.mint(accounts[4], mintAmount1);
//     await dai.approve(noLossDao.address, mintAmount1, {
//       from: accounts[4],
//     });
//     await noLossDao.createProposal('Some IPFS hash string1', {
//       from: accounts[4],
//     });
//     let proposalID2 = 2;

//     await dai.mint(accounts[6], mintAmount1);
//     await dai.approve(noLossDao.address, mintAmount1, {
//       from: accounts[6],
//     });
//     await noLossDao.createProposal('Some IPFS hash string2', {
//       from: accounts[6],
//     });
//     let proposalID3 = 3;

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 1
//     await noLossDao.distributeFunds();
//     //////////// ITERATION 1 /////////////////

//     await noLossDao.voteDirect(proposalID1, { from: accounts[1] });
//     await noLossDao.voteDirect(proposalID2, { from: accounts[2] }); // this proposal should win

//     // Create 3rd voting user (account 5) vote power = 6
//     await dai.mint(accounts[5], mintAmount1);
//     await dai.approve(noLossDao.address, mintAmount1, {
//       from: accounts[5],
//     });
//     await noLossDao.deposit(mintAmount1, { from: accounts[5] });

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 2
//     await noLossDao.distributeFunds(); //check who winner was
//     //////////// ITERATION 2 /////////////////

//     let winner = await noLossDao.topProject.call('1'); // winner of first iteration
//     assert.equal(proposalID2, winner.toString());

//     await noLossDao.voteDirect(proposalID1, { from: accounts[1] }); // 1 gets 6 votes
//     await expectRevert(
//       noLossDao.voteDirect(proposalID2, { from: accounts[2] }),
//       'Proposal is not active'
//     );
//     await noLossDao.voteDirect(proposalID1, { from: accounts[5] }); // 1 gets another 6 votes
//     // Proposal 1 should win

//     await time.increase(time.duration.seconds(1801)); // increment to iteration 3
//     await noLossDao.distributeFunds(); //check who winner was

//     await noLossDao.voteDirect(proposalID2, { from: accounts[1] }); // can now vote again for winning proposal
//     await expectRevert(
//       noLossDao.voteDirect(proposalID1, { from: accounts[2] }),
//       'Proposal is not active'
//     );
//   });
// });
