import { firestore } from './firebase';

export const emojiExists = async (emoji, networkSuffix = '') => {
  let docRef = firestore.collection('emojis' + networkSuffix).doc(emoji);

  let docSnapshot = await docRef.get();
  return docSnapshot.exists;
};

export const twitterHandleAlreadyLinked = async (handle, address) => {
  let docRef = firestore.collection('twitterHandlesAddresses').doc(handle);

  let docSnapshot = await docRef.get();

  if (docSnapshot.exists) {
    return docSnapshot.data().address.toLowerCase() === address.toLowerCase();
  } else {
    return false;
  }
};
