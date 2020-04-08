open Globals;

let since_id = ref("");
let currentIterationTweetId = ref("1243491650883780608");
let thisUserTwitterId = "1190359489603616773";

let twitInstance = Twit.makeTwitterHandler(.);
// NOTE: unsafe code! Just a quick hack to get it working.
let etherHandler = ref(()->Obj.magic);

let loopFunctionAsync = (proposalManager: ProposalManager.proposalsManager) => {
  let%Async tweetResult =
    Twit.getWithResult(
      twitInstance,
      "statuses/mentions_timeline",
      TwitPostArgs.makeMentionsArgs({since_id: since_id^}),
    );

  switch (tweetResult) {
  | TweetGetError(err) => Js.log2("Error processing tweet", err)
  | TweetGetSuccess(tweets) =>
    tweets[0]
    ->Option.map(tweet => {
        Database.setLatestTweetReply(tweet.id_str)->ignore;
        since_id := tweet.id_str;
      })
    ->ignore;
    Js.log("before forEach");
    let randomString = " " ++ (Random.int(5) mod 100)->string_of_int;

    tweets->Array.forEach(tweet => {
      switch (tweet.in_reply_to_status_id_str) {
      | Some(in_reply_to_status_id_str) =>
        if (in_reply_to_status_id_str != currentIterationTweetId^) {
          Twit.postTweetInReply(.
            twitInstance,
            "@"
            ++ tweet.user.screen_name
            ++ " Hi there, this post is no longer active. Please vote on this tweet: https://twitter.com/ParisMain1/status/"
            ++ currentIterationTweetId^
            ++ randomString,
            tweet.id_str,
            "@" ++ tweet.user.screen_name,
          )
          ->ignore;
          ();
        } else if (tweet.user.id_str === thisUserTwitterId) {
          // Do nothing.
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
              tweet.id_str ++ randomString,
              "@" ++ tweet.user.screen_name,
            )
            ->ignore
          | 1 =>
            let proposalId = proposalManager.getProjectIdFromEmoji(.);

            switch (proposalId) {
            | Some(id) =>
              %raw
              {|console.time('someFunction'+randomString)|};
              let ethHandler: Ethereum.ethereumObject = etherHandler^;
              ethHandler.noLossDao.methods.voteProxy(.
                ~proposalId=id->string_of_int,
                ~usersAddress=ethHandler.mainAddress,
              ).
                send({
                from: ethHandler.mainAddress,
              }).
                on(.
                 "transactionHash", hash => {
                Twit.postTweetInReply(.
                  twitInstance,
                  "@"
                  ++ tweet.user.screen_name
                  ++ " Your vote has been submitted. Thank you for voting @"
                  ++ tweet.user.screen_name
                  ++ " . https://kovan.etherscan.io/tx/"
                  ++ hash,
                  tweet.id_str,
                  "@" ++ tweet.user.screen_name,
                )
                ->ignore
              }).
                on(.
                 "receipt", _receipt => {
                // Js.log2("receipt", receipt);
                // TODO: check the transaction didn't revert
                Twit.postTweetInReply(.
                  twitInstance,
                  "@"
                  ++ tweet.user.screen_name
                  ++ " Your vote has been counted. Thank you for supporting great projects!",
                  tweet.id_str,
                  "@" ++ tweet.user.screen_name,
                )
                ->ignore
              }).
                //   on(.
                //    "confirmation", confirmationNumber => {
                //   Js.log2("confirmationNumber", confirmationNumber)
                // }).
                on(.
                 "error", _error => {
                Twit.postTweetInReply(.
                  twitInstance,
                  "@"
                  ++ tweet.user.screen_name
                  ++ " Unfortunately we were unable to vote for you. Support will handle this ASAP.",
                  tweet.id_str,
                  "@" ++ tweet.user.screen_name,
                )
                ->ignore
              })
              ->ignore;
              // ->catchAsync(err => Js.Promise.resolve(Result.Error(err)));
              %raw
              {|console.timeEnd('someFunction'+randomString)|};
              ();
            | None =>
              Twit.postTweetInReply(.
                twitInstance,
                "@"
                ++ tweet.user.screen_name
                ++ " Unfortunately we don't recognise that project ID. Please select an emoji of a listed project."
                ++ randomString,
                tweet.id_str,
                "@" ++ tweet.user.screen_name,
              )
              ->ignore
            };
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
      ~daoAddress="0x1bE540722f30FBB6a86F995F25a81F5BA5Ac4326",
      // ~daoAddress=Constants.getDaoAddress(),
    );

  etherHandler := ethObj;

  ()->async;
};

let start = () => {
  Js.log("Start");

  let%Async _ = asyncronousSetup();

  let%Async newSinceId = Database.getLatestTweetProcessed();
  // since_id := None->Option.mapWithDefault("1247927867993980931", a => a); // For testing...
  since_id := newSinceId->Option.mapWithDefault("1247927867993980931", a => a);

  let proposalManager = ProposalManager.setupProposalManager(.);

  let%Async _result = proposalManager.getCurrentProposals(.);

  loopFunction(proposalManager);

  // This is the app loop
  Js.Global.setInterval(() => loopFunction(proposalManager), 20000)->ignore;
  ()->async;
};

Js.Global.setInterval(() => (), 20000)->ignore;

start();
