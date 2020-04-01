import { firestore } from './firebase';

export const emojiExists = async (emoji, networkSuffix = '') => {
  let docRef = firestore.collection('emojis' + networkSuffix).doc(emoji);

  let docSnapshot = await docRef.get();
  return docSnapshot.exists;
};
