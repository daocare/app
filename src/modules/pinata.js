const pinataSDK = require('@pinata/sdk');
const axios = require('axios');
const fs = require('fs');

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

// export const uploadImage = (proposalHash, image) =>
//   new Promise((resolve, reject) => {
//     debugger;

//     const reader = new FileReader();

//     reader.addEventListener("load", function () {
//       // convert image file to base64 string
//       preview.src = reader.result;
//     }, false);

//     if (file) {
//       reader.readAsDataURL(file);
//     }

//     let reader = new window.FileReader();
//     // this.setState({ fileName: file.name });
//     reader.readAsArrayBuffer(image);
//     reader.onloadend = async () => {
//       const options = {
//         pinataMetadata: {
//           name: proposalHash + '-image',
//         },
//         pinataOptions: {
//           cidVersion: 0,
//         },
//       };
//       let result = await pinata.pinFileToIPFS(reader, options);
//       console.log(result);
//       resolve(result.IpfsHash);
//       // await this.convertToBuffer(reader);
//       // this.uploadFile();
//     };

//     // const readableStreamForFile = fs.createReadStream(image.name);
//   });
