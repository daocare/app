type statusObject = {
  status: string,
  in_reply_to_status_id: option(string),
};
type mentions = {since_id: string};
type tweetParams =
  | Status(statusObject)
  | MentionsTimeline(mentions);
type configAndCredentials = {
  consumer_key: string,
  consumer_secret: string,
  access_token: string,
  access_token_secret: string,
  timeout_ms: option(int),
  strictssl: option(bool),
};

type tweetDataUser = {
  // id: 1200874976582230000,
  id_str: string,
  name: string,
  screen_name: string,
  location: string,
  description: string,
  url: option(string),
  //  entities: { description: [Object] },
  protected: bool,
  followers_count: int,
  friends_count: int,
  listed_count: int,
  created_at: string,
  //  favourites_count: 0,
  //  utc_offset: null,
  //  time_zone: null,
  //  geo_enabled: false,
  //  verified: false,
  //  statuses_count: 10,
  //  lang: null,
  //  contributors_enabled: false,
  //  is_translator: false,
  //  is_translation_enabled: false,
  //  profile_background_color: 'F5F8FA',
  //  profile_background_image_url: null,
  //  profile_background_image_url_https: null,
  //  profile_background_tile: false,
  //  profile_image_url:
  //   'http://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
  //  profile_image_url_https:
  //   'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png',
  //  profile_link_color: '1DA1F2',
  //  profile_sidebar_border_color: 'C0DEED',
  //  profile_sidebar_fill_color: 'DDEEF6',
  //  profile_text_color: '333333',
  //  profile_use_background_image: true,
  //  has_extended_profile: false,
  //  default_profile: true,
  //  default_profile_image: true,
  //  can_media_tag: true,
  //  followed_by: false,
  //  following: false,
  //  follow_request_sent: false,
  //  notifications: false,
  //  translator_type: 'none'
};
type tweetData = {
  created_at: string,
  // id: ,
  id_str: string,
  text: string,
  truncated: bool,
  // entities: { hashtags: [], symbols: [], user_mentions: [], urls: [] },
  // source:
  //  '<a href="https://wildcards.world" rel="nofollow">wildcards_pigeon</a>',
  // in_reply_to_status_id: null,
  in_reply_to_status_id_str: option(string),
  // in_reply_to_user_id: null,
  in_reply_to_user_id_str: option(string),
  in_reply_to_screen_name: option(string),
  user: tweetDataUser,
  // geo: null,
  // coordinates: null,
  // place: null,
  // contributors: null,
  // is_quote_status: false,
  // retweet_count: 0,
  // favorite_count: 0,
  // favorited: false,
  // retweeted: false,
  // lang: 'en'
};

type tweetError = {
  message: string,
  code: int,
  //  allErrors: [ { code: 187, message: 'Status is a duplicate.' } ],
  //  twitterReply: { errors: [ [Object] ] },
  statusCode: int,
};

type tweetResult =
  | TweetError(tweetError)
  | TweetSuccess(tweetData);
type tweetGetResult =
  | TweetGetError(tweetError)
  | TweetGetSuccess(array(tweetData));

[@bs.deriving {abstract: light}]
type t = {
  post:
    (
      . string,
      TwitPostArgs.t,
      (. option(tweetError), tweetData, string) => unit
    ) =>
    unit,
  get:
    (
      . string,
      TwitPostArgs.t,
      (. option(tweetError), array(tweetData), string) => unit
    ) =>
    unit,
};

let twitterCredentials: configAndCredentials = [%raw
  {|require('../../../config.js')|}
];
[@bs.new] [@bs.module] external new_: configAndCredentials => t = "twit";

let makeTwitterHandler = (.) => new_(twitterCredentials);

let postWithResult = (twit, method, tweetArguments) => {
  let (p, resolve) = Promise.pending();
  twit->post(.
    method,
    tweetArguments,
    (. err, data, _response) => {
      switch (err) {
      | Some(error) => resolve(TweetError(error))
      | None => resolve(TweetSuccess(data))
      };
      ();
    },
  );
  p->Promise.Js.toBsPromise;
};

let postWithResult = (twit, method, tweetArguments) => {
  let (p, resolve) = Promise.pending();
  twit->get(.
    method,
    tweetArguments,
    (. err, data, _response) => {
      switch (err) {
      | Some(error) => resolve(TweetGetError(error))
      | None => resolve(TweetGetSuccess(data))
      };
      ();
    },
  );
  p->Promise.Js.toBsPromise;
};
