type t;

type statusObject = {
  status: string,
  in_reply_to_status_id: option(string),
};
type mentions = {since_id: string};

let makeMentionsArgs: mentions => t = Obj.magic;
let makeStatusArgs: statusObject => t = Obj.magic;
