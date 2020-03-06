var admin = require('firebase-admin');
var fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, 'config.js');
var config = require(configPath);

var serviceAccountPath = path.join(__dirname, 'firebase_service_key.json');

const TWITTER_HANLDES_DB = 'twitterHandlesAddresses';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: config.databaseURL,
});

const db = admin.firestore();

const isTwitterHandleRegistered = async handle => {
  let docRef = db.collection(TWITTER_HANLDES_DB).doc(handle);

  let docSnapshot = await docRef.get();
  return docSnapshot.exists;
};

const getAddressByHandle = async handle => {
  let doc = await db
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
  isTwitterHandleRegistered,
  getAddressByHandle,
};
