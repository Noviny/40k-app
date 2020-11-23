/** @jsx jsx */
import { jsx } from "@emotion/core";

const ShowError = ({ code = null, text = null }) => (
  <div>
    <p>
      Some kind of error occurred creating the battle. Here's the complete
      error, which noviny would probably find useful:
    </p>
    {text && text}
    {code && <code>{code}</code>}
  </div>
);

export default ShowError;
