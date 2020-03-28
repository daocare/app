var Twitter = require('twitter');

var path = require('path');

var configPath = path.join(__dirname, 'config.js');
var config = require(configPath);

var T = new Twitter(config);
const Web3 = require('web3');
const Box = require('3box');
// const moment = require('moment');
const firebase = require('./firebase');

const THIS_USER_TWITTER_ID = '1190359489603616773';

const {
  mnemonic,
  kovanProviderUrl,
} = require('../contracts/secretsManager.js');

let noLossDaoContract;
let mainAddress;

const setupWeb3 = async () => {
  const CHAIN_ID = 42;

  const noLossDaoAbi = require('../src/abis/NoLossDao.json');
  var HDWalletProvider = require('truffle-hdwallet-provider');
  var provider = new HDWalletProvider(mnemonic, kovanProviderUrl);

  const web3Inited = new Web3(provider);

  await web3Inited.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3Inited.utils.hexToNumber,
      },
    ],
  });

  const accounts = await web3Inited.eth.getAccounts();

  mainAddress = accounts[0];

  // const chainIdTemp = await web3Inited.eth.chainId();
  // const DAO_ADDRESS = noLossDaoAbi.networks[CHAIN_ID].address;
  const DAO_ADDRESS = process.env.REACT_APP_DAO_ADDRESS;
  console.log({ address: DAO_ADDRESS });

  noLossDaoContract = new web3Inited.eth.Contract(
    noLossDaoAbi.abi,
    DAO_ADDRESS
  );
};
// instanciate contracts

var params = {
  // q: 'to%3AParisMain1',
  // q: 'to%3A%40ParisMain1',
  // q: 'to%3A%40ParisMain1%0A',
  // q: '@ParisMain1',
  // count: 3,
  // result_type: 'recent',
  // lang: 'en',
};

const emojiRegex = /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F\u200D[\u2640\u2642]|(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC6F\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3C-\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDF])\u200D[\u2640\u2642])\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;

const postTweetInReply = (status, in_reply_to_status_id, username) => {
  console.log(in_reply_to_status_id);
  T.post(
    'statuses/update',
    {
      status,
      in_reply_to_status_id,
      username,
    },
    (err, data, _response) => {
      if (!err) {
        // console.log('worked', { data, _response });
        console.log('worked', { data });
      } else {
        console.log('error', err);
      }
    }
  );
};

const voteProxy = async (proposalId, usersAddress, id) => {
  console.log('vote params', { proposalId, usersAddress });
  let tx = await noLossDaoContract.methods
    .voteProxy(proposalId, usersAddress)
    .send({
      from: mainAddress,
    });
  postTweetInReply(
    'thank you for supporting projects you love! https://kovan.etherscan.io/tx/' +
      tx.transactionHash,
    proposalId
  );
  console.log({ tx });
};

// // setInterval(() => console.log("I'm still running"), 3000);
// var myVar = setInterval(function() {
//   // do stuff here
// }, 15000);
// // cancel after 5 min
// setTimeout(myStopFunction, 5 * 60 * 1000);
// // clears the interval
// function myStopFunction() {
//   clearInterval(myVar);
// }

const proccessedTweets = {};

let since_id = undefined;

const getRandomNumber = () => Math.floor(Math.random() * 1000);

const start = async () => {
  // await setupWeb3();
  since_id = ((await firebase.getLatestTweetProcessed()) || { latest: '0' })
    .latest;
  // since_id = '1243491650883780608';

  // console.log({ mainAddress });

  // See search  example from API here
  // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  setInterval(() => {
    console.log('looking for replies again');
    // T.get('statuses/show/1243491650883780608', params, async function(
    T.get('statuses/mentions_timeline', { ...params, since_id }, async function(
      err,
      data,
      response
    ) {
      if (!err) {
        const currentIterationTweetId = '1243491650883780608';

        if (data.length > 0) {
          firebase.setLatestTweetReply(data[0].id_str);
          since_id = data[0].id_str;
        }
        // console.log({ status: JSON.stringify(data, null, 2) });
        // console.log({ value: statuses });
        for (let i = 0; i < data.length; i++) {
          const status = data[i];
          const {
            id_str,
            text,
            in_reply_to_status_id_str,
            user: { id_str: userIdStr, screen_name },
          } = status;

          if (in_reply_to_status_id_str !== currentIterationTweetId) {
            console.log(
              'tweet on wrong post',
              in_reply_to_status_id_str,
              '!==',
              currentIterationTweetId
            );
            continue;
          }
          if (userIdStr === THIS_USER_TWITTER_ID) {
            console.log('Tweet from self', text);
            continue;
          }
          // console.log(i, status);

          const regexMatch = text.match(emojiRegex) || [];
          if (regexMatch.length < 1) {
            postTweetInReply(
              '@' +
                screen_name +
                " This tweet doesn't contain an emoji, please see our instructinos on how to vote...." +
                getRandomNumber(),
              id_str,
              '@' + screen_name
            );
            console.log("doesn't contain an emoji", text);
          } else if (regexMatch.length > 1) {
            postTweetInReply(
              '@' +
                screen_name +
                ' There are too many emojis in this tweet, which one do you want to use?' +
                getRandomNumber(),
              id_str,
              '@' + screen_name
            );
            console.log('too many emojis', text);
          } else {
            console.log('perfect!', text);
            const emoji = regexMatch[0];
            console.log('here we go', emoji);
            console.log(
              'WHAT WE WANT - ',
              await firebase.getProjectByEmoji(emoji)
            );
            postTweetInReply(
              '@' +
                screen_name +
                ' We have got your vote, we will give you details as soon as your vote is counted!' +
                getRandomNumber(),
              id_str,
              '@' + screen_name
            );
            setTimeout(
              () =>
                postTweetInReply(
                  '@' +
                    screen_name +
                    ' - your vote has been verified.' +
                    getRandomNumber(),
                  id_str,
                  '@' + screen_name
                ),
              10000
            );
          }
          continue;
          // console.log(data.statuses[i]);
          // Check if duplicate tweet we have already processed
          // Check if the tweet is related to us
          // id so we could reply to this tweet with completed etherscan tx or error msg
          if (!!proccessedTweets[id]) {
            continue;
          }
          proccessedTweets[id] = true;
          let utcString = data.statuses[i].created_at;
          var system_date = new Date(Date.parse(utcString));
          var user_date = new Date();
          var diff = Math.floor((user_date - system_date) / 1000);
          console.log('time passed', diff);
          if (diff > 120) {
            continue;
          }
          // username to check if they are on our 3box database
          // let username = data.statuses[i].user.screen_name;
          // scrape their vote from the text
          // let text = data.statuses[i].text;
          // const screen_name = data.satuses[i].user.screen_name;
          console.log({ text, screen_name });
          let dbEntry = await firebase.getAddressByHandle(screen_name);
          const foundEthAddrs = dbEntry ? dbEntry.address : null;
          const regexProposalId = /~(\d+)/g;
          const foundProposalId = text.match(regexProposalId);
          console.log(foundEthAddrs);
          console.log(foundProposalId);
          if (
            !!foundEthAddrs &&
            !!foundProposalId &&
            foundProposalId.length > 0
          ) {
            const userEthAddress = foundEthAddrs;
            const proposalId = foundProposalId[0].substring(1);
            console.log('found values', userEthAddress, proposalId);
            const profile = await Box.getProfile(userEthAddress);
            const verifiedAccounts = await Box.getVerifiedAccounts(profile);
            // console.log(data.statuses[i].user.s);
            if (
              !!verifiedAccounts.twitter &&
              !!verifiedAccounts.twitter.username &&
              verifiedAccounts.twitter.username === screen_name
            ) {
              console.log('TWITTER IS VERIFIED');
              if (i === 0) {
                voteProxy(proposalId, userEthAddress);
              }
            } else {
              console.log("Twitter isn't verified");
              T.post(
                'statuses/update',
                {
                  status:
                    'Thank you for supporting projects you love! Unfortunately we could not verify your twitter account',
                  in_reply_to_status_id: id,
                },
                (err, data, _response) => {
                  console.log('twitter not verified', { data, _response });
                }
              );
            }
            console.log({ verifiedAccounts });
          } else {
            console.log('invalid tweet format');
            T.post(
              'statuses/update',
              {
                status:
                  'This tweet is malformed. Please include your ethereum address and the project id you want to support',
                in_reply_to_status_id: id,
              },
              (err, data, _response) => {
                console.log('twitter not verified', { data, _response });
              }
            );
          }
        }
      } else {
        console.log(err);
      }
    });
  }, 20000);
  // console.log({ mainAddress });
  // // See search  example from API here
  // // https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  // setInterval(() => {
  //   console.log('looking for tweets again');
  //   T.get('search/tweets', params, async function(err, data, response) {
  //     // console.log({ value: data.statuses });
  //     if (!err) {
  //       for (let i = 0; i < data.statuses.length; i++) {
  //         // console.log(data.statuses[i]);

  //         // Check if duplicate tweet we have already processed
  //         // Check if the tweet is related to us

  //         // id so we could reply to this tweet with completed etherscan tx or error msg
  //         let id = data.statuses[i].id_str;
  //         if (!!proccessedTweets[id]) {
  //           continue;
  //         }

  //         proccessedTweets[id] = true;

  //         let utcString = data.statuses[i].created_at;
  //         var system_date = new Date(Date.parse(utcString));
  //         var user_date = new Date();
  //         var diff = Math.floor((user_date - system_date) / 1000);
  //         console.log('time passed', diff);

  //         if (diff > 120) {
  //           continue;
  //         }

  //         // username to check if they are on our 3box database
  //         // let username = data.statuses[i].user.screen_name;
  //         // scrape their vote from the text
  //         let text = data.statuses[i].text;
  //         const screen_name = data.statuses[i].user.screen_name;

  //         console.log({ text, screen_name });

  //         let dbEntry = await firebase.getAddressByHandle(screen_name);
  //         const foundEthAddrs = dbEntry ? dbEntry.address : null;

  //         const regexProposalId = /~(\d+)/g;
  //         const foundProposalId = text.match(regexProposalId);
  //         console.log(foundEthAddrs);
  //         console.log(foundProposalId);

  //         if (
  //           !!foundEthAddrs &&
  //           !!foundProposalId &&
  //           foundProposalId.length > 0
  //         ) {
  //           const userEthAddress = foundEthAddrs;
  //           const proposalId = foundProposalId[0].substring(1);
  //           console.log('found values', userEthAddress, proposalId);

  //           const profile = await Box.getProfile(userEthAddress);
  //           const verifiedAccounts = await Box.getVerifiedAccounts(profile);

  //           // console.log(data.statuses[i].user.s);

  //           if (
  //             !!verifiedAccounts.twitter &&
  //             !!verifiedAccounts.twitter.username &&
  //             verifiedAccounts.twitter.username === screen_name
  //           ) {
  //             console.log('TWITTER IS VERIFIED');
  //             if (i === 0) {
  //               voteProxy(proposalId, userEthAddress);
  //             }
  //           } else {
  //             console.log("Twitter isn't verified");
  //             T.post(
  //               'statuses/update',
  //               {
  //                 status:
  //                   'Thank you for supporting projects you love! Unfortunately we could not verify your twitter account',
  //                 in_reply_to_status_id: id,
  //               },
  //               (err, data, _response) => {
  //                 console.log('twitter not verified', { data, _response });
  //               }
  //             );
  //           }

  //           console.log({ verifiedAccounts });
  //         } else {
  //           console.log('invalid tweet format');
  //           T.post(
  //             'statuses/update',
  //             {
  //               status:
  //                 'This tweet is malformed. Please include your ethereum address and the project id you want to support',
  //               in_reply_to_status_id: id,
  //             },
  //             (err, data, _response) => {
  //               console.log('twitter not verified', { data, _response });
  //             }
  //           );
  //         }
  //       }
  //     } else {
  //       console.log(err);
  //     }
  //   });
  // }, 8000);
};

start();
