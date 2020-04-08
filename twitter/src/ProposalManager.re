type proposalsManager = {
  currentProposals: string,
  proposalEmojiLookup: string,
  getCurrentProposals: (. unit) => Js.Promise.t(unit),
};

[@bs.module "./proposalManager"]
external setupProposalManager: (. unit) => proposalsManager =
  "setupProposalManager";
