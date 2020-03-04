// const config = require('../config/config');

var admin = require('firebase-admin');

const TWITTER_HANLDES_DB = 'twitterHandlesAddresses';

const isTwitterHandleRegistered = async handle => {
  let docRef = admin
    .firestore()
    .collection(TWITTER_HANLDES_DB)
    .doc(handle);

  let docSnapshot = await docRef.get();
  return docSnapshot.exists;
};

const registerTwitterHandle = async (handle, address, txHash) => {
  await admin
    .firestore()
    .collection(TWITTER_HANLDES_DB)
    .doc(handle)
    .set({ handle, address, txHash, timestamp: Date.now() / 1000 });
};

// const updateParcel = async parcel => {
//   let parcelDoc = await admin
//     .firestore()
//     .collection('parcels')
//     .doc(parcel.id)
//     .update(parcel);
// };

// const deleteParcel = async id => {
//   await admin
//     .firestore()
//     .collection('parcels')
//     .doc(id)
//     .delete();
// };

const getAddressByHandle = async handle => {
  let doc = await admin
    .firestore()
    .collection(TWITTER_HANLDES_DB)
    .doc(handle)
    .get();
  if (doc.exists) {
    return doc.data();
  } else {
    return null;
  }
};

module.exports = {
  admin,
  // firestore,
  isTwitterHandleRegistered,
  registerTwitterHandle,
  getAddressByHandle,
};
