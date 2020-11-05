/** @jsx jsx */
import { jsx, ObjectInterpolation } from "@emotion/core";
import { InputHTMLAttributes } from "react";

import { colours } from "../../lib/colours";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  labelCss?: ObjectInterpolation<any>;
  inputCss?: ObjectInterpolation<any>;
};

const Input = ({
  label,
  labelCss = {},
  inputCss = {},
  ...rest
}: InputProps) => (
  <div css={{ paddingTop: 12 }}>
    <label
      css={{
        width: 80,
        display: "inline-block",
        textAlign: "right",
        paddingRight: 4,
        ...labelCss,
      }}
      htmlFor="email"
    >
      {label}:
    </label>
    <input
      css={{
        borderRadius: 4,
        border: `solid ${colours.neutral300} 1px`,
        ...inputCss,
      }}
      {...rest}
    />
  </div>
);

export { Input };
