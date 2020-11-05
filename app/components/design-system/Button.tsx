/** @jsx jsx */
import { jsx } from "@emotion/core";
import isRelativeUrl from "is-relative-url";
import { default as NextLink } from "next/link";
import { ReactNode } from "react";
import { colours } from "../../lib/colours";

const defaultStyles = {
  padding: 8,
  border: 0,
  borderRadius: 6,
  height: "max-content",
};

const styles = {
  action: {
    ...defaultStyles,
    backgroundColor: colours.green100,
    ":hover": {
      backgroundColor: colours.green200,
    },
    ":active": {
      backgroundColor: colours.green300,
    },
    ":disabled": {
      backgroundColor: colours.neutral100,
      color: colours.neutral400,
    },
  },
  // warning: {
  //   ...defaultStyles,
  //   backgroundColor: palette.green100,
  //   ":hover": {
  //     backgroundColor: palette.green200,
  //   },
  //   ":active": {
  //     backgroundColor: palette.green300,
  //   },
  //   ":disabled": {
  //     backgroundColor: palette.neutral300,
  //   },
  // },
} as const;

const Link = ({ href, mode, ...rest }) =>
  isRelativeUrl(href) ? (
    <NextLink href={href}>
      <a {...rest} css={styles[mode]} />
    </NextLink>
  ) : (
    <a href={href} {...rest} css={styles[mode]} />
  );

export const Button = ({
  href,
  mode = "action",
  ...rest
}: {
  href?: string;
  mode?: keyof typeof styles;
  onClick?: () => any;
  children: ReactNode;
  disabled?: boolean;
}) =>
  href ? (
    <Link href={href} mode={mode} {...rest} />
  ) : (
    <button {...rest} css={styles[mode]} />
  );
