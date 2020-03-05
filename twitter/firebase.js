var admin = require('firebase-admin');
var config = require('./config.js');

const serviceAccount = './firebase_service_key.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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
