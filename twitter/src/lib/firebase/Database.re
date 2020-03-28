open Firebase;
open Globals;

let tweetRepliesDb = "tweetReplies";
let tweetRepliesCollection = "tweet_replies";

let credential: credential = [%raw {|require("./firebase_service_key.json")|}];

let firebaseAdmin = initializeApp({credential: credential});
let db = firebaseAdmin->App.firestore;

type latestTweet = {latest: string};

let getLatestTweetProcessed: unit => Js.Promise.t(option(latestTweet)) =
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

        Some(docSnapshot.data()->dangerouslyConvertLatestTweet);
      } else {
        None;
      }
    )
    ->async;
  };
