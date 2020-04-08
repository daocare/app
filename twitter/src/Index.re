open Globals;

let since_id = ref("");
let currentIterationTweetId = ref("1243491650883780608");
let thisUserTwitterId = "1190359489603616773";

let twitInstance = Twit.makeTwitterHandler(.);
// NOTE: unsafe code! Just a quick hack to get it working.
let etherHandler = ref(()->Obj.magic);

let loopFunctionAsync = () => {
  let%Async tweetResult =
    Twit.postWithResult(
      twitInstance,
      "statuses/mentions_timeline",
      TwitPostArgs.makeMentionsArgs({since_id: since_id^}),
    );

  Js.log(tweetResult);

  switch (tweetResult) {
  | TweetGetError(err) => Js.log2("Error processing tweet", err)
  | TweetGetSuccess(tweets) =>
    tweets[0]
    ->Option.map(tweet => {
        // Database.setLatestTweetReply(tweet.id_str)->ignore;
        since_id := tweet.id_str
      })
    ->ignore;
    Js.log("before forEach");

    tweets->Array.forEach(tweet => {
      switch (tweet.in_reply_to_status_id_str) {
      | Some(in_reply_to_status_id_str) =>
        if (in_reply_to_status_id_str != currentIterationTweetId^) {
          Js.log4(
            "tweet on wrong post",
            in_reply_to_status_id_str,
            "!=",
            currentIterationTweetId,
          );
        } else if (tweet.user.id_str === thisUserTwitterId) {
          Js.log("Tweet from self - ignore");
        } else if (true) {
          let getResults = (_emojiRegex, _string) => [%raw
            {| _string.match(_emojiRegex) || [] |}
          ];
          let results = getResults(emojiRegex, tweet.text);

          switch (results->Array.length) {
          | 0 => Js.log("No vote found")

          | 1 =>
            let ethHandler: Ethereum.ethereumObject = etherHandler^;
            let result =
              ethHandler.noLossDao.methods.voteProxy(.
                ~proposalId="1",
                ~usersAddress=ethHandler.mainAddress,
              ).
                send({
                from: ethHandler.mainAddress,
              })
              ->catchAsync(err => Js.Promise.resolve(err));
            Js.log2("promise result", result);
            let getResult = () => {
              let%Async resolved = result;
              Js.log2("Result result", resolved);
              ()->async;
            };
            getResult()->ignore;
            ();
          | _ => Js.log("there are more than 1 emojis in this tweet!")
          };
        }
      | None => Js.log("tweet isn't a response")
      }
    });
  //   // console.log(i, status);
  //   const regexMatch = text.match(emojiRegex) || [];
  };
  ()->async;
};
let loopFunction = () => {
  loopFunctionAsync()->ignore;
};

let asyncronousSetup = () => {
  let%Async ethObj =
    Ethereum.setupWeb3(.
      ~chainId=42,
      ~mnemonic=Secrets.Ethereum.mnemonic_string,
      ~providerUrl=Secrets.Ethereum.providerId,
      ~daoAddress=Constants.getDaoAddress(),
    );

  etherHandler := ethObj;

  ()->async;
};

let start = () => {
  Js.log("Start");

  let%Async _ = asyncronousSetup();
  // let%Async newSinceId = Database.getLatestTweetProcessed();
  // Js.log(newSinceId);
  since_id := None->Option.mapWithDefault("1243508584228556803", a => a);
  // since_id := newSinceId->Option.mapWithDefault("1243508584228556803", a => a);

  Js.log("calling function");
  loopFunction();
  Js.log("starting app loop");

  // This is the app loop
  // Js.Global.setkInterval(loopFunction, 20000)->ignore;
  ()->async;
};

Js.Global.setInterval(() => (), 20000)->ignore;

start();
