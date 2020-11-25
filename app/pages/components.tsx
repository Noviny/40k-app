/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Input } from "../components/design-system/Input";

const NewInput = (props) => (
  <Input
    label=""
    labelCss={{ width: 32 }}
    inputCss={{ width: 32, display: "block" }}
    type="number"
    {...props}
  />
);

const PerTurnScoring = ({}) => {
  return (
    <div css={{ display: "flex", maxWidth: 640 }}>
      <NewInput label="T1" value={0} />
      <NewInput label="T2" value={0} />
      <NewInput label="T3" value={0} />
      <NewInput label="T4" value={0} />
      <NewInput label="T5" value={0} />
    </div>
  );
};

export default PerTurnScoring;
