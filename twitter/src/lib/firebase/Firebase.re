module Firestore = {
  type t;

  module DocumentReference = {
    type t;

    // NOT TYPE SAFE BUT USE `Obj.magic`
    type someData;

    type result = {
      exists: bool,
      data: unit => someData,
    };

    [@bs.send] external update: (t, 'a) => Js.Promise.t(unit) = "update";

    [@bs.send] external get: t => Js.Promise.t(result) = "get";
  };

  module CollectionReference = {
    type t;
    [@bs.send] external doc: (t, string) => DocumentReference.t = "doc";
  };
  [@bs.send]
  external collection: (t, string) => CollectionReference.t = "collection";
};

module App = {
  type t;

  [@bs.send] external firestore: t => Firestore.t = "firestore";
};

type credential;
type firebaseOptions = {
  credential,
  // databaseURL: string,
};

[@bs.module "firebase-admin"]
external initializeApp: firebaseOptions => App.t = "initializeApp" /* })*/;
