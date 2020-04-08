open Globals;

let since_id = ref("");
let currentIterationTweetId = ref("1243491650883780608");
let thisUserTwitterId = "1190359489603616773";

let twitInstance = Twit.makeTwitterHandler(.);
// NOTE: unsafe code! Just a quick hack to get it working.
let etherHandler = ref(()->Obj.magic);

let loopFunctionAsync = proposalManager => {
  let%Async tweetResult =
    Twit.postWithResult(
      twitInstance,
      "statuses/mentions_timeline",
      TwitPostArgs.makeMentionsArgs({since_id: since_id^}),
    );

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
          Twit.postTweetInReply(.
            twitInstance,
            "@"
            ++ tweet.user.screen_name
            ++ " Hi there, this post is no longer active. Please vote on this tweet: https://twitter.com/ParisMain1/status/"
            ++ tweet.user.screen_name,
            tweet.id_str,
            "@" ++ tweet.user.screen_name,
          )
          ->ignore;
          ();
        } else if (tweet.user.id_str === thisUserTwitterId) {
          Js.log("Tweet from self - ignore");
        } else if (true) {
          let getResults = (_emojiRegex, _string) => [%raw
            {| _string.match(_emojiRegex) || [] |}
          ];
          let results = getResults(emojiRegex, tweet.text);

          switch (results->Array.length) {
          | 0 =>
            Twit.postTweetInReply(.
              twitInstance,
              "@"
              ++ tweet.user.screen_name
              ++ " Hi there, please select an emoji from above, to make your vote. Please don't hesitate to ask if you need help getting setup!",
              tweet.id_str,
              "@" ++ tweet.user.screen_name,
            )
            ->ignore
          | 1 =>
            Twit.postTweetInReply(.
              twitInstance,
              "@"
              ++ tweet.user.screen_name
              ++ " Your vote has been submitted. Thank you for voting @"
              ++ tweet.user.screen_name,
              tweet.id_str,
              "@" ++ tweet.user.screen_name,
            )
            ->ignore;
            // THE COMMENTED OUT CODE BELOW VOTES FOR YOU ON TWITTER.
            let randomString = Random.int(5)->string_of_int;
            Js.log(randomString);
            %raw
            {|console.time('someFunction'+randomString)|};
            let ethHandler: Ethereum.ethereumObject = etherHandler^;
            ethHandler.noLossDao.methods.voteProxy(.
              ~proposalId="1",
              ~usersAddress=ethHandler.mainAddress,
            ).
              send({
              from: ethHandler.mainAddress,
            }).
              on(.
               "transactionHash", hash => {
              Js.log2("hash", hash)
            }).
              on(.
               "receipt", receipt => {
              Js.log2("receipt", receipt)
            }).
              //   on(.
              //    "confirmation", confirmationNumber => {
              //   Js.log2("confirmationNumber", confirmationNumber)
              // }).
              on(.
               "error", error => {
              Js.log2("error", error)
            })
            ->ignore;
            // ->catchAsync(err => Js.Promise.resolve(Result.Error(err)));
            %raw
            {|console.timeEnd('someFunction'+randomString)|};
            ();
          | _ =>
            Twit.postTweetInReply(.
              twitInstance,
              "@"
              ++ tweet.user.screen_name
              ++ " Please only include 1 emoji on your tweet if you want to vote.",
              tweet.id_str,
              "@" ++ tweet.user.screen_name,
            )
            ->ignore
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
let loopFunction = proposalManager => {
  loopFunctionAsync(proposalManager)->ignore;
};

let asyncronousSetup = () => {
  let%Async ethObj =
    Ethereum.setupWeb3(.
      ~chainId=42,
      ~mnemonic=Secrets.Ethereum.mnemonic_string,
      ~providerUrl=Secrets.Ethereum.providerId,
      // ~daoAddress="0x1bE540722f30FBB6a86F995F25a81F5BA5Ac4326",
      ~daoAddress=Constants.getDaoAddress(),
    );

  etherHandler := ethObj;

  ()->async;
};

let start = () => {
  Js.log("Start");

  let%Async _ = asyncronousSetup();

  since_id := None->Option.mapWithDefault("1243508584228556803", a => a);

  let proposalManager = ProposalManager.setupProposalManager(.);

  let%Async _result = proposalManager.getCurrentProposals(.);

  loopFunction(proposalManager);

  // This is the app loop
  // Js.Global.setkInterval(loopFunction, 20000)->ignore;
  ()->async;
};

Js.Global.setInterval(() => (), 20000)->ignore;

start();
