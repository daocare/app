open Firebase;
open Globals;

let tweetRepliesDb = "tweetReplies";
let twitterHandlesDb = "twitterHandlesAddresses";
let tweetRepliesCollection = "tweet_replies";

let credential = [%raw
  {|require('path').join(__dirname, 'firebase_service_key.json')|}
];

let firebaseAdmin = initializeApp({credential: credentialCert(credential)});
let db = firebaseAdmin->App.firestore;

type latestTweet = {latest: string};

let getLatestTweetProcessed: unit => Js.Promise.t(option(string)) =
  () => {
    open Firestore;
    let docRef =
      db
      ->collection(tweetRepliesDb)
      ->CollectionReference.doc(tweetRepliesCollection);
    let%Async docSnapshot = docRef->DocumentReference.get;
    (
      if (docSnapshot.exists) {
        let dangerouslyConvertLatestTweet:
          DocumentReference.someData => latestTweet = Obj.magic;

        Some(docSnapshot.data(.)->dangerouslyConvertLatestTweet.latest);
      } else {
        None;
      }
    )
    ->async;
  };

let getEthAddressFromEmoji: string => Js.Promise.t(option(string)) =
  handle => {
    open Firestore;
    let docRef =
      db->collection(tweetRepliesDb)->CollectionReference.doc(handle);
    let%Async docSnapshot = docRef->DocumentReference.get;
    (
      if (docSnapshot.exists) {
        Some(docSnapshot.data(.)->Obj.magic);
      } else {
        None;
      }
    )
    ->async;
  };

let setLatestTweetReply: string => Js.Promise.t(unit) =
  latest => {
    open Firestore;
    let docRef =
      db
      ->collection(tweetRepliesDb)
      ->CollectionReference.doc(tweetRepliesCollection);
    let%Async _docSnapshot =
      docRef->DocumentReference.update({latest: latest});

    ()->async;
  };