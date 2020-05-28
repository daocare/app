open Firebase;
open Globals;

let tweetRepliesDb = "tweetReplies";
let twitterHandlesDb = "twitterHandlesAddresses";
let tweetRepliesCollection = "tweet_replies";
let tweetIterationTrackerDBCollection = "tweetIterationTrackerKovan";
let tweetIterationTrackerDocument = "tweetIterationTrackerKovan";

let credential = [%raw
  {|require('path').join(__dirname, 'firebase_service_key.json')|}
];

let firebaseAdmin = initializeApp({credential: credentialCert(credential)});
let db = firebaseAdmin->App.firestore;

type latestTweet = {latest: string};
type latestIterationTweet = {
  latest: string,
  iteration: string,
};

let getLatestTweetProcessed: unit => Js.Promise.t(option(string)) =
  () => {
    Js.log("1");
    open Firestore;
    Js.log("2");
    let docRef =
      db
      ->collection(tweetRepliesDb)
      ->CollectionReference.doc(tweetRepliesCollection);
    Js.log("3");
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

type addressLookupResult = {address: string};
let getEthAddressFromTwitter:
  // {
  //   handle: 'denhampreen',
  //   timestamp: 1586204164.92,
  //   txHash: null,
  //   address: '0xcBc6e270d5f1D20EEFBa88e679b7De4829C4e23b'
  // }
  string => Js.Promise.t(option(addressLookupResult)) =
  handle => {
    open Firestore;
    let lowerCaseHandle = handle->Js.String.toLowerCase;
    let docRef =
      db
      ->collection(twitterHandlesDb)
      ->CollectionReference.doc(lowerCaseHandle);
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

let setLatestTweetIteration:
  (~latestTweetId: string, ~iteration: string) => Js.Promise.t(unit) =
  (~latestTweetId, ~iteration) => {
    open Firestore;
    let docRef =
      db
      ->collection(tweetIterationTrackerDBCollection)
      ->CollectionReference.doc(tweetIterationTrackerDocument);
    let%Async _docSnapshot =
      docRef->DocumentReference.update({iteration, latest: latestTweetId});

    ()->async;
  };

//Refactor into single request
let getLatestTweetIterationData:
  unit => Js.Promise.t(option(latestIterationTweet)) =
  () => {
    open Firestore;
    let docRef =
      db
      ->collection(tweetIterationTrackerDBCollection)
      ->CollectionReference.doc(tweetIterationTrackerDocument);
    // let%Async _docSnapshot = docRef->DocumentReference.get();
    let%Async docSnapshot = docRef->DocumentReference.get;
    (
      if (docSnapshot.exists) {
        let dangerouslyConvertLatestTweet:
          DocumentReference.someData => latestIterationTweet = Obj.magic;
        let res = docSnapshot.data(.)->dangerouslyConvertLatestTweet;
        Some(res);
      } else {
        None;
      }
    )
    ->async;
  };