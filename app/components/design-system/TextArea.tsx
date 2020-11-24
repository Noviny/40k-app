/** @jsx jsx */
import { jsx } from "@emotion/core";
import { palette } from "../../../palette";

const Textarea = (props) => (
  <textarea
    css={{
      width: "100%",
      borderRadius: 4,
      border: `solid ${palette.neutral500} 1px`,
      fontFamily: "inherit",
      padding: 4,
    }}
    rows={5}
    {...props}
  />
);

export { Textarea };
