/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMutation, useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import Select from "react-select";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "../../design-system/Button";
import { Textarea } from "../../design-system/TextArea";
import { armyInfoFragment } from "../../../lib/fragments";
import MissionDisplay from "../../MissionDisplay";

import { GET_AVAILABLE_SECONDARIES } from "../../../lib/queries";
import ShowError from "../../Error";
const UPDATE_INFO = gql`
  mutation preBattleUpdateInfo($armyInfoID: ID!, $notes: String!) {
    updateBattleInfo(id: $armyInfoID, data: { notes: $notes }) {
      id
      notes
    }
  }
` as import("../../../../__generated__/ts-gql/preBattleUpdateInfo").type;

const MAKE_BATTLE_ACTIVE = gql`
  mutation activateBattle($id: ID!) {
    updateBattle(id: $id, data: { status: inProgress }) {
      id
    }
  }
` as import("../../../../__generated__/ts-gql/activateBattle").type;

const UPDATE_AN_OBJECTIVE = gql`
  mutation updateAnObjective($objID: ID!, $rulesID: ID!) {
    updateObjective(
      id: $objID
      data: { selection: { connect: { id: $rulesID } } }
    ) {
      id
    }
  }
` as import("../../../../__generated__/ts-gql/updateAnObjective").type;

const CHECK_OPPONENT_READY = gql`
  query checkOpponentReady($id: ID!) {
    BattleInfo(where: { id: $id }) {
      id
      secondaries {
        id
        score
        selection {
          id
          name
          category
        }
      }
    }
  }
` as import("../../../../__generated__/ts-gql/checkOpponentReady").type;

const PickSecondary = ({
  availableSecondaries,
  secondaryID,
  num,
  selection,
}) => {
  const [updateSeconday] = useMutation(UPDATE_AN_OBJECTIVE);

  const options = useMemo(() => {
    if (!availableSecondaries) return [];

    let cats = {};

    availableSecondaries.forEach(({ name, category, rules, id }) => {
      if (!cats[category]) cats[category] = [];
      cats[category].push({ value: id, label: name, rules });
    });

    return Object.entries(cats).map(([label, options]) => ({ label, options }));
  }, [availableSecondaries]);

  const defaultValue = selection
    ? {
        value: selection.id,
        label: selection.name,
        rules: selection.rules,
      }
    : null;

  return (
    <>
      <h2>Pick Secondary {num + 1}</h2>
      <Select
        defaultValue={defaultValue}
        options={options}
        onChange={({ value }, { action }) =>
          action === "select-option" &&
          updateSeconday({
            variables: { objID: secondaryID, rulesID: value },
          })
        }
      />
    </>
  );
};

const validateSecondaries = (
  secondaries: typeof armyInfoFragment.___type.result.secondaries = []
) => {
  // TODO: On error here, actually respond to the error differently - displaying relevant text
  if (!secondaries) {
    return {
      status: "error",
      code: "noSecondaries",
    };
  }

  const selectedSecondaries = secondaries
    .map(({ selection }) => selection)
    .filter((a) => a);
  if (selectedSecondaries.length !== 3) {
    return {
      status: "error",
      code: "notEnoughSelected",
    };
  }

  const categories = new Set(
    selectedSecondaries.map(({ category }) => category)
  );

  if (categories.size !== 3) {
    return {
      status: "error",
      code: "duplicateCategory",
      info: { categories: categories.entries() },
    };
  }

  return { status: "ready" };
};

const PlayerPlanning = ({
  army,
  missionId,
  battleId,
  opponentID,
  refetch,
}: {
  army: typeof armyInfoFragment.___type.result;
  missionId: string;
  battleId: string;
  refetch: Function;
  opponentID: string;
}) => {
  const { data } = useQuery(GET_AVAILABLE_SECONDARIES, {
    variables: { missionID: missionId },
  });

  const { data: opponentSecondaries } = useQuery(CHECK_OPPONENT_READY, {
    variables: { id: opponentID },
    pollInterval: 5000,
  });

  const opponentReady = useMemo(
    () => validateSecondaries(opponentSecondaries?.BattleInfo?.secondaries),
    [opponentSecondaries]
  );
  const iAmReady = useMemo(() => validateSecondaries(army.secondaries), [
    army.secondaries,
  ]);

  const availableSecondaries = useMemo(
    () =>
      data?.allObjectiveOptions
        // TODO we should be able to make a better filter here so we don't need to filter out primaries
        .filter(({ category }) => category !== "primary")
        .concat(data?.Mission?.secondary),
    [data?.Mission, data?.allObjectiveOptions]
  );

  const [preBattleUpdateInfo] = useMutation(UPDATE_INFO);
  const [activateBattle, { error, loading }] = useMutation(MAKE_BATTLE_ACTIVE);

  // we assume if there is no army, that means that the user is not logged in
  // this is an accurate but inellegant handle
  if (!army) {
    return (
      <div>Game has not yet started, please wait a bit before spectating</div>
    );
  }

  const [notes, setNotes] = useState(army.notes || "");

  if (error) return <ShowError code={JSON.stringify(error, null, 2)} />;

  // TODO: validate your secondaries picks and warn for errors
  // Major errors are:
  //    Picking the same secondary twice
  //    Having two secondaries from the same category
  return (
    <>
      <MissionDisplay id={missionId} />
      <i>
        NOTE: Before selecting secondaries, you should exchange army lists with
        your opponent
      </i>
      <div css={{ paddingTop: 8 }}>
        <Link href={`/battle/${battleId}/secondary-options`}>
          <a>View all secondaries rules</a>
        </Link>
      </div>
      {army.secondaries.map(({ id, selection }, i) => (
        <PickSecondary
          key={id}
          num={i}
          secondaryID={id}
          selection={selection}
          availableSecondaries={availableSecondaries}
        />
      ))}
      <div>
        <h2>Pre-mission notes:</h2>
        <Textarea
          value={notes}
          onChange={({ target }) => setNotes(target.value)}
          placeholder="This would be a great place to note down units you have in reserve, or psychic powers"
        />
      </div>
      <div
        css={{
          display: "flex",
          justifyContent: "space-around",
          paddingTop: 8,
        }}
      >
        <Button
          onClick={() =>
            preBattleUpdateInfo({
              variables: {
                armyInfoID: army.id,
                notes,
              },
            }).then(() => refetch())
          }
        >
          Update Info
        </Button>
        <Button
          disabled={
            opponentReady.status !== "ready" || iAmReady.status !== "ready"
          }
          isLoading={loading}
          onClick={() =>
            activateBattle({ variables: { id: battleId } })
              .then(() => refetch())
              .catch((e) => console.log(e))
          }
        >
          Begin Battle
        </Button>
      </div>
      {iAmReady.code === "duplicateCategory" && (
        <p>
          More than one of your secondaries are from the same category. You'll
          need to pick again.
        </p>
      )}
    </>
  );
};

export default PlayerPlanning;
