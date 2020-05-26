[%raw {|require('isomorphic-fetch')|}];

module ProjectsQuery = [%graphql
  {|
    query
         {
           projects(first:1 ) {
            id
            benefactor {id}
             projectDataIdentifier
             projectState
           }
         }
  |}
];

let makeQuery = () => {
  let projectsQuery = ProjectsQuery.make();
  let projectsQueryMade = Gql.gql(. projectsQuery##query);

  Gql.makeQuery(
    projectsQueryMade,
    None,
    (. result) => {
      Js.log2("The result", result);
      ();
      // let actualLatestStateChangeHash =
      //   LatestStateChangeHashQuery.parse(eventData)##stateChanges
      //   ->Array.getUnsafe(0)##id;
      // if (actualLatestStateChangeHash != latestStageChangeHash^) {
      //   Js.log3(actualLatestStateChangeHash, "!=", latestStageChangeHash^);
      //   Js.log(
      //     "The count was out of sync! Restarting the subscription. It went out of sync after polling  times.",
      //   );
      //   startSubscribeToStateChangeEvents(stateChangeSubscriptionMade);
      // } else {
      //   ();
      // };
    },
  );
};