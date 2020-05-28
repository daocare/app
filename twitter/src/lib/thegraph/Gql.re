type queryString;
type queryCreator = (. string) => queryString;

[@bs.module "graphql-tag"] external gql: queryCreator = "default";

type callback = (. Js.Json.t) => unit;

[@bs.module "./gql.js"]
external makeQuery: (queryString, option(Js.Json.t), callback) => unit =
  "subscribe";