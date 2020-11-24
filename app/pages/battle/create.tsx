/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMutation, useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useMemo, useState } from "react";
import Select from "react-select";
import { useRouter } from "next/router";
import { missionTypes } from "../../../constants";
import { Textarea } from "../../components/design-system/TextArea";
import { Button } from "../../components/design-system/Button";
import { Input } from "../../components/design-system/Input";
import MissionDisplay from "../../components/MissionDisplay";

const missionTypesArray = Object.entries(missionTypes)
  .map(([key, rest]) => ({
    key,
    ...rest,
  }))
  .sort((a, b) => (a.maxPoints < b.maxPoints ? 1 : 0));

const getMissionSize = (points): typeof missionTypesArray[0] => {
  let bestMission;

  for (let mission of missionTypesArray) {
    if (mission.maxPoints >= points) bestMission = mission;
  }

  if (!bestMission) {
    bestMission = missionTypesArray.find(({ key }) => key === "onslaught");
  }
  return bestMission;
};

const CREATE_BATTLE = gql`
  mutation createABattle(
    $points: Int!
    $description: String!
    $missionID: ID!
    $army1ID: ID!
    $army2ID: ID!
    $startingCP: Int!
    $primaryID: ID!
    $date: String!
  ) {
    createBattle(
      data: {
        points: $points
        description: $description
        mission: { connect: { id: $missionID } }
        status: planning
        playDate: $date
        army1: {
          create: {
            army: { connect: { id: $army1ID } }
            primary: {
              create: {
                name: "Primary"
                score: 0
                selection: { connect: { id: $primaryID } }
              }
            }
            CP: $startingCP
            secondaries: { create: [{ score: 0 }, { score: 0 }, { score: 0 }] }
          }
        }
        army2: {
          create: {
            army: { connect: { id: $army2ID } }
            primary: {
              create: {
                name: "Primary"
                score: 0
                selection: { connect: { id: $primaryID } }
              }
            }
            CP: $startingCP
            secondaries: { create: [{ score: 0 }, { score: 0 }, { score: 0 }] }
          }
        }
      }
    ) {
      id
      army1 {
        id
      }
    }
  }
` as import("../../../__generated__/ts-gql/createABattle").type;

const ArmySelect = ({ allArmies, label, onChange }) => (
  <Select
    label={label}
    isSearchable={false}
    placeholder={label}
    options={allArmies.map(({ name, faction, owner, id }) => ({
      value: id,
      label: `${owner.name}: ${faction} (${name})`,
    }))}
    onChange={(item, { action }) =>
      action === "select-option" && onChange(item.value)
    }
    styles={{
      container: (provided) => ({ ...provided, flex: 1 }),
    }}
  />
);

const GET_INITIAL_DATA = gql`
  query getCreateInitialData {
    allMissions {
      id
      name
      source
      forceSize
      primary {
        id
      }
    }
    allArmies {
      id
      name
      faction
      owner {
        id
        name
      }
    }
  }
` as import("../../../__generated__/ts-gql/getCreateInitialData").type;

const useMissionStuff = () => {
  const [missionID, setMissionID] = useState<undefined | string>();
  const [primaryID, setPrimaryID] = useState<undefined | string>();

  const updateMissions = ({
    value,
    primaryID,
  }: {
    value: string;
    primaryID: string;
  }) => {
    setMissionID(value);
    setPrimaryID(primaryID);
  };

  return { missionID, primaryID, updateMissions };
};

const Create = () => {
  const { data } = useQuery(GET_INITIAL_DATA);

  // TODO: make this form accessible instead of these hacks
  const [army1ID, setArmy1] = useState();
  const [army2ID, setArmy2] = useState();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [points, setPoints] = useState(2000);
  const [chosenSource, setChosenSource] = useState("core rulebook");
  const { missionID, primaryID, updateMissions } = useMissionStuff();
  const [description, setDescription] = useState("");
  const { push } = useRouter();

  let missionSize = useMemo(() => getMissionSize(points), [points]);
  const sources = ["core rulebook", "grand tournament 2020"];

  const [createABattle, { data: createData }] = useMutation(CREATE_BATTLE);

  const missions = useMemo(
    () =>
      data?.allMissions
        ?.filter(({ forceSize }) => forceSize === missionSize.key, [
          missionSize.key,
        ])
        .filter(({ source }) => source === chosenSource)
        .map(({ name, id, primary }) => ({
          value: id,
          label: name,
          primaryID: primary.id,
        })),
    [missionSize.key, data?.allMissions]
  );

  if (!data) return "loading";
  const { allArmies } = data;

  if (createData) {
    push(`/battle/${createData.createBattle.id}`);
  }

  const createDisabled = !(
    army1ID &&
    army2ID &&
    points &&
    missionID &&
    army1ID !== army2ID
  );
  return (
    <div>
      {allArmies ? (
        <div>
          <div
            css={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ArmySelect
              label="Select First Army"
              allArmies={allArmies}
              onChange={setArmy1}
            />
            <div css={{ textAlign: "center", width: 32 }}>V</div>
            <ArmySelect
              label="Select Second Army"
              allArmies={allArmies}
              onChange={setArmy2}
            />
          </div>
          <div css={{ display: "flex", alignItems: "baseline" }}>
            <Input
              label="Set Number of Points"
              labelCss={{ width: "auto" }}
              inputCss={{ textAlign: "center" }}
              type="number"
              value={points}
              onChange={({ target }) => setPoints(parseInt(target.value))}
            />
            <span css={{ paddingLeft: 16 }}>({missionSize.label})</span>
          </div>
          <div>
            <div
              css={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>Select Mission</h2>
              <Button
                onClick={() =>
                  updateMissions(
                    missions[Math.floor(Math.random() * missions.length)]
                  )
                }
              >
                Randomly Pick
              </Button>
            </div>
            <Select
              isSearchable={false}
              options={missions}
              value={missions.find(({ value }) => value === missionID)}
              onChange={(item, { action }) =>
                action === "select-option" && updateMissions(item)
              }
            />
          </div>
          {/* <Select
            isSearchable={false}
            options={sources.map((s) => ({ label: s, value: s }))}
            onChange={(item, { action }) =>
              action === "select-option" && setChosenSource(item)
            }
          /> */}
          {missionID && <MissionDisplay id={missionID} />}
          <div css={{ paddingTop: 8 }}>
            <label css={{ paddingRight: 8 }}>Select Date</label>
            <input
              type="date"
              value={date}
              onChange={({ target }) => setDate(target.value)}
            />
          </div>
          <div>
            <h2>Describe the scenario (flavor stuff)</h2>
            <Textarea
              value={description}
              onChange={({ target }) => setDescription(target.value)}
            />
          </div>
          {army1ID && army1ID === army2ID && (
            <div>
              You've selected one army to fight against itself - you'll need to
              change one side
            </div>
          )}
          <div
            css={{
              display: "flex",
              justifyContent: "space-around",
              paddingTop: 8,
            }}
          >
            <Button
              disabled={createDisabled}
              onClick={() => {
                createABattle({
                  variables: {
                    army1ID,
                    army2ID,
                    points,
                    missionID,
                    description,
                    startingCP: missionSize.startingCP,
                    primaryID,
                    date,
                  },
                });
              }}
            >
              Create Mission
            </Button>
          </div>
        </div>
      ) : (
        "no data"
      )}
    </div>
  );
};

export default Create;

// TODO: use getStaticProps here
// export async function getStaticProps() {
//   const { query } = initializeApollo();

//   const { data } = await query({
//     query: GET_ARMIES,
//   });

//   console.log(data);
//   return { props: {} };
// }
