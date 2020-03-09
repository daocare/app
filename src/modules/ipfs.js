const IFPS_HOST = 'ipfs.infura.io';
const IPFS_PROTOCOL = 'https';

const IPFS = require('ipfs-api');

export const getIpfs = () => {
  return new IPFS({ host: IFPS_HOST, port: 5001, protocol: IPFS_PROTOCOL });
};

export const getIpfsUrl = hash => {
  return IPFS_PROTOCOL + '://' + IFPS_HOST + '/ipfs/' + hash;
};

export const uploadObjectIpfs = obj => {
  return new Promise((resolve, reject) => {
    let ipfs = getIpfs();
    var buffer = Buffer.from(JSON.stringify(obj));

    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
    ipfs.add(buffer, (err, ipfsHash) => {
      if (err) {
        reject(err);
      } else {
        let hash = ipfsHash[0].hash;
        let url = getIpfsUrl(hash);
        resolve({ hash, url });
      }

      //setState by setting ipfsHash to ipfsHash[0].hash
    });
  });
};
