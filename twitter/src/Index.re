open Globals; // https://twitter.com/Avo141378579/status/1262694952200536064

let since_id = ref("");
let currentIterationId = ref(9);
let currentIterationTweetId = ref("1262694952200536064");
//https://tweeterid.com/ <- Converter tool to convert handle to id
let thisUserTwitterId = "1262377326052085762";

let twitInstance = Twit.makeTwitterHandler(.);
// NOTE: unsafe code! Just a quick hack to get it working.
let etherHandler = ref(()->Obj.magic);

let loopFunctionAsync = (proposalManager: ProposalManager.proposalsManager) => {
  let%Async currentIteration = proposalManager.getIteration(.);
  Js.log3("current iteration", currentIteration, currentIterationId^);

  if (false) {
    // if (currentIteration != currentIterationId^) {
    // This is safety so we don't re-create a tweet for an iteration.
    if (currentIteration == currentIterationId^ + 1) {
      currentIterationId := currentIteration;
      // let%Async _ = proposalManager.getCurrentProposals(.);
      Js.log("Increased Iteration, attempitng to make tweet");

      // let%Async _ =
      //   Twit.newIterationTweet(.
      //     twitInstance,
      //     "We have a new iteration. Please vote on one of the following projects\n\n",
      //     // ++ proposalManager.getProjectsTweetString(.),
      //   );

      let%Async tweetUpdateResult =
        Twit.postWithResult(
          twitInstance,
          "statuses/update",
          TwitPostArgs.makeStatusArgs({
            status: "We have a new iteration. Please vote on one of the following projects -- number 5\n\n",
            // ++ proposalManager.getProjectsTweetString(.)

            in_reply_to_status_id: None,
          }),
        );
      switch (tweetUpdateResult) {
      | TweetSuccess(tweetData) =>
        currentIterationTweetId := tweetData.id_str;

        let _ =
          Database.setLatestTweetIteration(
            ~latestTweetId=tweetData.id_str,
            ~iteration=currentIteration->string_of_int,
          )
          |> Js.Promise.catch(_error => {
               Js.log("some unknown error setting latestTweetId in firebase");
               Js.Promise.resolve();
             });
        ();
      | TweetError(error) => Js.log(error)
      };

      ()->async;
    } else {
      ()->async;
    };
  } else {
    let%Async tweetResult =
      Twit.getWithResult(
        twitInstance,
        "statuses/mentions_timeline",
        TwitPostArgs.makeMentionsArgs({since_id: since_id^}),
      );

    Js.log2("Tweet result", tweetResult);

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
              ++ " Hi there, this post was not on the main thread. Please vote on this tweet: https://twitter.com/ParisMain1/status/"  //TODO: remove ParisMain1
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
          } else {
            let getResults = (_emojiRegex, _string) => [%raw
              {| _string.match(_emojiRegex) || [] |}
            ];
            let results = getResults(emojiRegex, tweet.text);
            Js.log2("The tweet text", tweet.text);

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
              let proposalId =
                proposalManager.getProjectIdFromEmoji(.
                  results->Array.getUnsafe(0),
                );
              Js.log2("THE PROPOSAL ID", proposalId);
              // TODO: add checks if the user is eligable to vote.
              switch (proposalId) {
              | Some(id) =>
                let ethHandler: Ethereum.ethereumObject = etherHandler^;
                {
                  let%Async ethAddressResponse =
                    Database.getEthAddressFromTwitter(tweet.user.screen_name);
                  Js.log3(
                    "getting twitter name---",
                    ethAddressResponse,
                    tweet.user.screen_name,
                  );
                  switch (ethAddressResponse) {
                  | Some(result) =>
                    Js.log2("the in transaction attempt result", result);
                    let address = result.address;
                    Js.log4(
                      "Eth transaction being sent",
                      id->string_of_int,
                      address,
                      ethHandler.mainAddress,
                    );
                    ethHandler.noLossDao.methods.voteProxy(.
                      ~proposalId=id->string_of_int,
                      ~usersAddress=address //TODO
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
                        ++ " Your vote is being processed. Thank you for voting @"
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
                      "error", error => {
                      Js.log2("THE ERROR", error);
                      Twit.postTweetInReply(.
                        twitInstance,
                        "@"
                        ++ tweet.user.screen_name
                        ++ " Unfortunately we were unable to vote for you. Support will handle this ASAP @JasoonSmythe. (Choppy choppy Jason)",
                        tweet.id_str,
                        "@" ++ tweet.user.screen_name,
                      )
                      ->ignore;
                    })
                    ->ignore;
                  | None =>
                    Twit.postTweetInReply(.
                      twitInstance,
                      "@"
                      ++ tweet.user.screen_name
                      ++ "We are unable to find your twitter address in our system. Have you verified your twitter account with 3box?",
                      tweet.id_str,
                      "@" ++ tweet.user.screen_name,
                    )
                    ->ignore
                  };
                  ()->async;
                };
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
    };
    ()->async;
  };
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

  let%Async newSinceId = Database.getLatestTweetProcessed();

  // since_id := "1262698684233416706"; // For testing...
  since_id := newSinceId->Option.mapWithDefault("1262694952200536064", a => a);
  Js.log("loaded sinceId");

  // let%Async {  latest: latestIterationTweetId,
  // iteration: string,: latest, latestIteration} =
  let%Async iterationDetailsOpt = Database.getLatestTweetIterationData();

  currentIterationTweetId :=
    iterationDetailsOpt->Option.mapWithDefault(
      "1262694952200536064", iterationDetails =>
      iterationDetails.latest
    );

  currentIterationId :=
    iterationDetailsOpt
    ->Option.flatMap(iterationDetails =>
        iterationDetails.iteration->int_of_string_opt
      )
    ->Option.getWithDefault(0);

  ()->async;
};

let start = () => {
  {
    Database.getEthAddressFromTwitter("denhampreen");
  };
  Js.log("Start");

  // Runs all pre-setup tasks.
  let%Async _ = asyncronousSetup();
  Js.log("loaded setup");

  let proposalManager = ProposalManager.setupProposalManager(.);

  Js.log("loaded the proposalManager");
  let%Async _result = proposalManager.getCurrentProposals(.);
  // let%Async currentIteration = proposalManager.getIteration(.);
  // currentIterationId := currentIteration;
  Js.log("loaded the the currentProposals");

  Js.log("calling loop function");
  loopFunction(proposalManager);

  // This is the app loop
  Js.Global.setInterval(() => loopFunction(proposalManager), 20000)->ignore;
  ()->async;
};

// This just keeps the code alive.
let _ = Js.Global.setInterval(() => (), 20000);

start();