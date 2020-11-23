/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMutation } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { colours } from "../lib/colours";
import { BattleInfo } from "../lib/fragments";
import useDebouncedState from "../lib/use-debounced-state";

type BoardProps = BattleInfo & {
  isInteractable?: boolean;
};

const UPDATE_OBJECTIVE_SCORE = gql`
  mutation updateObjective($id: ID!, $score: Int!) {
    updateObjective(id: $id, data: { score: $score }) {
      id
      score
    }
  }
` as import("../../__generated__/ts-gql/updateObjective").type;

const UPDATE_CP = gql`
  mutation updateCP($id: ID!, $CP: Int!) {
    updateBattleInfo(id: $id, data: { CP: $CP }) {
      id
      CP
    }
  }
` as import("../../__generated__/ts-gql/updateCP").type;

const Objective = ({
  name,
  score: initialScore,
  isInteractable,
  max = 15,
  id,
  bonusCss = {},
}) => {
  const [{ score }, updateScore] = useDebouncedState(
    { id, score: parseInt(initialScore) },
    UPDATE_OBJECTIVE_SCORE
  );

  return (
    <li
      key={name}
      css={{ display: "flex", justifyContent: "space-between", ...bonusCss }}
    >
      <span>{name}:</span>
      <span>
        {isInteractable ? (
          <input
            type="number"
            value={score}
            onChange={({ target }) =>
              updateScore({
                id,
                score: parseInt(target.value),
                skipUpdate: target.value === "",
              })
            }
            css={{ width: 40, textAlign: "center" }}
            min="0"
            max={max}
          />
        ) : (
          score
        )}
      </span>
    </li>
  );
};

const Board = ({
  primary,
  secondaries,
  isInteractable = false,
  army,
  CP: initialCP,
  notes,
  id,
}: BoardProps) => {
  const [{ CP }, updateCP] = useDebouncedState(
    { id, CP: initialCP },
    UPDATE_CP
  );

  return (
    <div css={{ maxWidth: 200, display: "inline-block" }}>
      <h2>{army.owner.name}</h2>
      <ul css={{ padding: 0 }}>
        <Objective
          {...primary}
          bonusCss={{ fontWeight: "bold" }}
          name={primary.selection.name}
          max={45}
          isInteractable={isInteractable}
        />
        {secondaries.map((secondary) => (
          <Objective
            {...secondary}
            name={secondary.selection.name}
            key={secondary.selection.name}
            isInteractable={isInteractable}
          />
        ))}
        <li
          key={name}
          css={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>CP:</span>
          <span>
            {isInteractable ? (
              <input
                type="number"
                value={CP}
                onChange={({ target }) =>
                  updateCP({
                    id,
                    CP: parseInt(target.value),
                    skipUpdate: target.value === "",
                  })
                }
                css={{ width: 40, textAlign: "center" }}
                min="0"
                max="99"
              />
            ) : (
              CP
            )}
          </span>
        </li>
      </ul>
      <div
        css={{
          paddingBottom: 8,
          paddingTop: 8,
          borderTop: `1px solid ${colours.neutral300}`,
        }}
      >
        <span css={{ paddingRight: 4 }}>Current score:</span>
        <span>
          {primary.score +
            secondaries.reduce((acc, b) => {
              return acc + b.score;
            }, 0)}
        </span>
      </div>
      <div
        css={{
          borderTop: `1px solid ${colours.neutral300}`,
          padding: 12,
          borderRadius: 3,
        }}
      >
        <b>Pre-battle notes:</b>
        <p>{notes}</p>
      </div>
    </div>
  );
};

const Boards = ({ army1, army2, isInteractable }) => (
  <div css={{ display: "flex", justifyContent: "space-around" }}>
    <Board {...army1} isInteractable={isInteractable} />
    <Board {...army2} isInteractable={isInteractable} />
  </div>
);

export default Boards;
