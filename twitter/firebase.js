var admin = require('firebase-admin');
var fs = require('fs');
var path = require('path');

var configPath = path.join(__dirname, 'config.js');
var config = require(configPath);

var serviceAccountPath = path.join(__dirname, 'firebase_service_key.json');

const TWITTER_HANLDES_DB = 'twitterHandlesAddresses';
const VOTE_EMOJIS_DB = 'emojis';
const TWEET_REPLIES_DB = 'tweetReplies';
const TWEET_REPLIES_COLLECTION = 'tweet_replies';

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
    return undefined;
  }
};

const getProjectByEmoji = async emoji => {
  let docRef = db.collection(VOTE_EMOJIS_DB).doc(emoji);

  let docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    return docSnapshot.data();
  } else {
    return undefined;
  }
};

const setLatestTweetReply = async latest => {
  let docRef = db.collection(TWEET_REPLIES_DB).doc(TWEET_REPLIES_COLLECTION);

  let docSnapshot = await docRef.update({ latest });
  console.log('Latest reply after setting it', docSnapshot);
  if (docSnapshot.exists) {
    return docSnapshot.data();
  } else {
    return undefined;
  }
};
const getLatestTweetProcessed = async () => {
  let docRef = db.collection(TWEET_REPLIES_DB).doc(TWEET_REPLIES_COLLECTION);

  let docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    return docSnapshot.data();
  } else {
    return undefined;
  }
};

module.exports = {
  isTwitterHandleRegistered,
  getAddressByHandle,
  getProjectByEmoji,
  setLatestTweetReply,
  getLatestTweetProcessed,
};
