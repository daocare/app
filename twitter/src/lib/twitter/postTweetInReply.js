// This is a quick hack

const postTweetInReply = (T, status, in_reply_to_status_id, username) => {
  console.log(in_reply_to_status_id);


  console.log("***********")
  console.log("***********")
  console.log("***********")
  console.log("TWITTER REPLY:")
  console.log(status)
  console.log("***********")
  console.log("***********")
  console.log("***********")
  // T.post(
  //   'statuses/update',
  //   {
  //     status,
  //     in_reply_to_status_id,
  //     username,
  //   },
  //   (err, data, _response) => {
  //     if (!err) {
  //       console.log('worked', { data });
  //     } else {
  //       console.log('error', err);
  //     }
  //   }
  // );
};

module.exports = { postTweetInReply }
