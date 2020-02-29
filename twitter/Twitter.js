var Twitter = require('twitter');
var config = require('./config.js');
var T = new Twitter(config);

var params = {
  q: '#whooptogether',
  count: 3,
  result_type: 'recent',
  lang: 'en',
};

// See search  example from API here
// https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
T.get('search/tweets', params, function(err, data, response) {
  if (!err) {
    for (let i = 0; i < data.statuses.length; i++) {
      // Check if duplicate tweet we have already processed
      // Check if the tweet is related to us

      // id so we could reply to this tweet with completed etherscan tx or error msg
      let id = { id: data.statuses[i].id_str };
      // username to check if they are on our 3box database
      let username = data.statuses[i].user.screen_name;
      // scrape their vote from the text
      let text = data.statuses[i].text;

      console.log(text);
    }
  } else {
    console.log(err);
  }
});
