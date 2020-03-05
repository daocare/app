const functions = require('firebase-functions');

const twitterDb = require('./modules/twitterDb');
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
