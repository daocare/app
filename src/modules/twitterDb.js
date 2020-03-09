import { firestore } from './firebase';

export const emojiExists = async emoji => {
  let docRef = firestore.collection('emojis').doc(emoji);

  let docSnapshot = await docRef.get();
  return docSnapshot.exists;
};
