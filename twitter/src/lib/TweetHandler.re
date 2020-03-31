Dotenv.config();

Belt.Int.fromString;

// type verifyTweetObj = {
//   ethAddress: string,
//   tweetId: string,
//   twitterHandle: string,
// };
// type verifyTweetResultObj = {
//   success: bool,
//   message: string,
// };

// type tweetHandlers = {
//   getVerification: (. verifyTweetObj) => verifyTweetResultObj,
//   makeTweet:
//     (~status: string, ~in_reply_to_status_id: option(string)) =>
//     Promise.t(Twit.tweetResult),
// };

// [@bs.module "./createGetVerificationFunc"]
// external createGetVerification:
//   (. ((. unit) => NodeGraphqlTest.Twit.t)) =>
//   (. verifyTweetObj) => verifyTweetResultObj =
//   "default";

// let registerTweetHandler = (~makeTwitterHandler) => {
//   let getVerification = createGetVerification(. makeTwitterHandler);
//   let makeTweet = (~status, ~in_reply_to_status_id) => {
//     let twit = makeTwitterHandler(.);

//     twit->Twit.postWithResult(
//       "statuses/update",
//       status,
//       in_reply_to_status_id,
//     );
//   };
//   {getVerification, makeTweet};
// };

// let tweetHandler = registerTweetHandler(~makeTwitterHandler);
