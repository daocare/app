type proposalsManager = {
  currentProposals: string,
  proposalEmojiLookup: string,
  getCurrentProposals: (. unit) => Js.Promise.t(unit),
  getProjectIdFromEmoji: (. string) => option(int),
  getIteration: (. unit) => Js.Promise.t(int),
  getProjectsTweetString: (. unit) => string,
};

[@bs.module "./proposalManager"]
external setupProposalManager: (. unit) => proposalsManager =
  "setupProposalManager";
