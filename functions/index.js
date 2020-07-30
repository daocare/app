const functions = require('firebase-functions');

const twitterDb = require('./modules/twitterDb');
const emojiDb = require('./modules/emojiDb');

var admin = require('firebase-admin');
const Box = require('3box');

const cors = require('cors')({
  origin: true,
});

admin.initializeApp();

exports.registerTwitterHandle = functions.https.onRequest(
  (request, response) => {
    return cors(request, response, async () => {
      try {
        let { handle, address, txHash } = request.body;

        console.log({ handle, address, txHash });
        // 1. check if handle is already associated
        let handleExists = await twitterDb.isTwitterHandleRegistered(handle);
        if (handleExists) {
          let error =
            'This twitter account is already associated with another address.';
          response.status(500).send(error);
          throw new Error(error);
        }

        // 2. verify 3box
        const profile = await Box.getProfile(address);
        const verifiedAccounts = await Box.getVerifiedAccounts(profile);

        if (
          Boolean(verifiedAccounts.twitter) &&
          Boolean(verifiedAccounts.twitter.username) &&
          verifiedAccounts.twitter.username === handle
        ) {
          console.log('TWITTER IS VERIFIED');
        } else {
          let error = 'This twitter account is not verified on 3Box';
          response.status(500).send(error);
          throw new Error(error);
        }

        // // 3. verify balance

        // // TODO
        // verify that the user being saved to twitterdb in firebase has a deposit in the dao contract

        // // 4. add to firebase
        await twitterDb.registerTwitterHandle(handle, address, txHash);

        response.json({ result: 'OK' });
      } catch (error) {
        response.status(500).send({ error });
        throw error;
      }
    });
  }
);

exports.registerEmoji = functions.https.onRequest((request, response) => {
  return cors(request, response, async () => {
    try {
      let { emoji, handle, isTestnet } = request.body;
      console.log(request.body);
      console.log(typeof request.body);
      console.log({ emoji, handle });

      if (isTestnet) {
        await emojiDb.registerEmojiKovan(handle, emoji);
      } else {
        await emojiDb.registerEmoji(handle, emoji);
      }

      response.json({ result: 'OK' });
    } catch (error) {
      response.status(500).send({ error });
      throw error;
    }
  });
});
