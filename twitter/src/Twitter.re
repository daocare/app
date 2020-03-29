open Globals;

let since_id = ref("");

let twitInstance = Twit.makeTwitterHandler(.);

let loopFunctionAsync = () => {
  let%Async newSinceId = Database.getLatestTweetProcessed();
  since_id := newSinceId->Option.mapWithDefault("1243508584228556803", a => a);

  let%Async tweetResult =
    Twit.postWithResult(
      twitInstance,
      "statuses/mentions_timeline",
      TwitPostArgs.makeMentionsArgs({since_id: since_id^}),
    );
  ()->async;
};
let loopFunction = () => {
  loopFunctionAsync()->ignore;
};

let start = () => {
  loopFunction();

  // This is the app loop
  Js.Global.setInterval(loopFunction, 20000);
};

start();
