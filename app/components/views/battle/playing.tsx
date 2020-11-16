/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMutation } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";

import { Button } from "../../design-system/Button";
import Boards from "../../Boards";
import { Textarea } from "../../design-system/TextArea";
import useDebouncedState from "../../../lib/use-debounced-state";

const END_BATTLE = gql`
  mutation endBattle($id: ID!) {
    updateBattle(id: $id, data: { status: completed }) {
      id
    }
  }
` as import("../../../../__generated__/ts-gql/endBattle").type;

const UPDATE_DESCRIPTION = gql`
  mutation updateBattleDescription($id: ID!, $description: String!) {
    updateBattle(id: $id, data: { description: $description }) {
      id
      description
    }
  }
` as import("../../../../__generated__/ts-gql/updateBattleDescription").type;

const PlayerPlaying = ({ theirArmy, myArmy, battleId, description }) => {
  const [args, udpateDescription] = useDebouncedState(
    { id: battleId, description: description },
    UPDATE_DESCRIPTION
  );

  const [endBattle] = useMutation(END_BATTLE);

  return (
    <>
      <Boards army1={myArmy} army2={theirArmy} isInteractable />
      <div>
        <Textarea
          value={args.description}
          onChange={({ target }) =>
            udpateDescription({ ...args, description: target.value })
          }
        />
      </div>
      <div css={{ display: "flex", justifyContent: "center", paddingTop: 24 }}>
        <Button onClick={() => endBattle({ variables: { id: battleId } })}>
          End Battle
        </Button>
      </div>
    </>
  );
};

export default PlayerPlaying;
