open Firebase;
open Globals;

let tweetRepliesDb = "tweetReplies";
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
    Js.log2("snapshot", docSnapshot);
    (
      if (docSnapshot.exists) {
        Js.log("It doesn't exist");
        let dangerouslyConvertLatestTweet:
          DocumentReference.someData => latestTweet = Obj.magic;

        Some(docSnapshot.data(.)->dangerouslyConvertLatestTweet.latest);
      } else {
        Js.log("It DOES exist");
        None;
      }
    )
    ->async;
  };
