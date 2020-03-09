const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

const pinata = pinataSDK(
  '085ac1eb0e0a04056f88',
  'a582b7011bd01dbac7f2e031f77b72c8480053272e065e6d751ccebef4e9131d'
);

const pinataEndpoint = 'https://gateway.pinata.cloud/ipfs/';

export const uploadJson = async (name, json) => {
  const options = {
    pinataMetadata: {
      name: name,
    },
    pinataOptions: {
      cidVersion: 0,
    },
  };
  let result = await pinata.pinJSONToIPFS(json, options);
  console.log(result);
  return result.IpfsHash;
};

export const getJson = async hash => {
  let json = await axios.get(pinataEndpoint + hash);
  return json.data;
};

export const pinHash = async (hash, filename) => {
  const options = {
    pinataMetadata: {
      name: filename,
    },
  };
  let res = await pinata.addHashToPinQueue(hash, options);
  return res;
};
