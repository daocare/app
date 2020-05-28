// This is a quick hack

const postTweetInReply = (T, status, in_reply_to_status_id, username) => {
  console.log(in_reply_to_status_id);

  console.log('***********');
  console.log('***********');
  console.log('***********');
  console.log('TWITTER REPLY:');
  console.log(status);
  console.log('***********');
  console.log('***********');
  console.log('***********');
  T.post(
    'statuses/update',
    {
      status,
      in_reply_to_status_id,
      username,
    },
    (err, data, _response) => {
      if (!err) {
        console.log('worked', { data });
      } else {
        console.log('error', err);
      }
    }
  );
};

const newIterationTweet = (T, status) => {
  // console.log(in_reply_to_status_id);

  console.log('***********');
  console.log('***********');
  console.log('***********');
  console.log('NEW ITERATION TWEET:');
  console.log(status);
  console.log('***********');
  console.log('***********');
  console.log('***********');
  T.post(
    'statuses/update',
    {
      status,
    },
    (err, data, _response) => {
      if (!err) {
        console.log('worked', { data });
      } else {
        console.log('error', err);
      }
    }
  ).then((resultFromTwitter) => console.log(resultF));
};

module.exports = { postTweetInReply, newIterationTweet };
