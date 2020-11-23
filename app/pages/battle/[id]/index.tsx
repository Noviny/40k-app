/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";

import { useRouter } from "next/router";
import PlayerPlanning from "../../../components/views/battle/planning";
import PlayerPlaying from "../../../components/views/battle/playing";
import PostBattle from "../../../components/views/battle/postbattle";
import SpectatorMode from "../../../components/views/battle/spectator";
import { BattleInfo } from "../../../lib/fragments";
import { AUTHED_USER } from "../../../lib/queries";

const GET_BATTLE = gql`
  query getBattle($id: ID!) {
    Battle(where: { id: $id }) {
      status
      id
      mission {
        id
      }
      description
      army1 {
        ...Army_info
      }
      army2 {
        ...Army_info
      }
    }
  }
` as import("../../../../__generated__/ts-gql/getBattle").type;

type PlayerViewProps = typeof GET_BATTLE.___type.result.Battle & {
  userId: String;
  refetch: Function;
  startPolling: Function;
};

const sortArmies = (army1, army2, userId) => {
  let myArmy, theirArmy;

  if (army1.army.owner.id === userId) {
    myArmy = army1;
    theirArmy = army2;
  } else if (army2.army.owner.id === userId) {
    myArmy = army2;
    theirArmy = army1;
  }
  return { myArmy, theirArmy };
};

const PlayerView = ({
  army1,
  army2,
  status,
  userId,
  id,
  mission,
  refetch,
  startPolling,
  description,
}: PlayerViewProps) => {
  const { myArmy, theirArmy } = sortArmies(army1, army2, userId);

  if (status === "planning") {
    return (
      <PlayerPlanning
        army={myArmy}
        missionId={mission.id}
        refetch={refetch}
        opponentID={theirArmy.id}
        battleId={id}
      />
    );
  } else if (status === "inProgress") {
    startPolling(2000);

    return (
      <PlayerPlaying
        battleId={id}
        myArmy={myArmy}
        theirArmy={theirArmy}
        description={description}
      />
    );
  } else {
    return (
      <div>
        An unexpected error occurred. Try refreshing? Or contact your nearest
        code manager
      </div>
    );
  }
};

// TODO: highlight which you are from this
const Header = ({
  army1,
  army2,
  userId,
}: {
  userId?: String;
  army1: BattleInfo;
  army2: BattleInfo;
}) => {
  let { myArmy, theirArmy } = sortArmies(army1, army2, userId);
  if (myArmy) {
    return (
      <h1 css={{ textAlign: "center" }}>
        {myArmy.army.name} vs. {theirArmy.army.name}
      </h1>
    );
  }
  return (
    <h1 css={{ textAlign: "center" }}>
      {army1.army.name} vs. {army2.army.name}
    </h1>
  );
};

const BattleView = () => {
  const {
    query: { id },
  } = useRouter();
  const { error, refetch, data: battleData, startPolling } = useQuery(
    GET_BATTLE,
    {
      // @ts-ignore
      variables: { id },
    }
  );

  const { data: userData } = useQuery(AUTHED_USER);

  if (error) {
    return (
      <div>
        Something went wrong fetching data - maybe you are logged out? Here is
        the full error: {JSON.stringify(error)}
      </div>
    );
  }

  if (!battleData || !userData) {
    return <div>Fetching info for the battle</div>;
  }

  const { Battle } = battleData;
  const { authenticatedUser } = userData;

  const { army1, army2, ...rest } = Battle;

  if (Battle.status === "completed") {
    return <PostBattle army1={army1} army2={army2} />;
  }

  if (sortArmies(army1, army2, authenticatedUser.id).myArmy) {
    return (
      <>
        <Header army1={army1} army2={army2} userId={authenticatedUser.id} />
        <PlayerView
          {...Battle}
          userId={authenticatedUser.id}
          refetch={refetch}
          startPolling={startPolling}
        />
      </>
    );
  } else {
    return (
      <>
        <Header army1={army1} army2={army2} />
        <SpectatorMode army1={army1} army2={army2} {...rest} />
      </>
    );
  }
};

export default BattleView;
