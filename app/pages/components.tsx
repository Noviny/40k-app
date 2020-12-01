/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useState } from "react";
import { Input } from "../components/design-system/Input";

const NewInput = (props) => (
  <Input
    labelCss={{ width: 32, textAlign: "center", padding: 0 }}
    inputCss={{ width: 32, display: "block" }}
    type="number"
    max={15}
    min={0}
    {...props}
  />
);

const PerTurnScoring = ({ turns = [], updateValue }) => (
  <div css={{ display: "flex", maxWidth: 640 }}>
    {turns.map((value, index) => (
      <NewInput
        key={index}
        value={value}
        label={`T${index + 1}`}
        onChange={({ target }) => updateValue(index, target.value)}
      />
    ))}
  </div>
);

const Demo = () => {
  let [turns, updateTurns] = useState([0, 0, 0, 0, 0]);

  return (
    <PerTurnScoring
      turns={turns}
      updateValue={(index, newVal) => {
        let newTurns = [...turns];
        newTurns[index] = parseInt(newVal);
        updateTurns(newTurns);
      }}
    />
  );
};

export default Demo;
