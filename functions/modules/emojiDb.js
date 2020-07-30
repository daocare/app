// const config = require('../config/config');

var admin = require('firebase-admin');

const EMOJIS_DB_KOVAN = 'emojis-kovan';

const registerEmojiKovan = async (handle, emoji) => {
  await admin
    .firestore()
    .collection(EMOJIS_DB_KOVAN)
    .doc(emoji)
    .set({ twitter: handle });
};

const EMOJIS_DB = 'emojis';

const registerEmoji = async (handle, emoji) => {
  await admin
    .firestore()
    .collection(EMOJIS_DB)
    .doc(emoji)
    .set({ twitter: handle });
};

module.exports = {
  admin,
  registerEmojiKovan,
  registerEmoji,
};
