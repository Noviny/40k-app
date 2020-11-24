/** @jsx jsx */
import { css, Global, jsx } from "@emotion/core";
import { ApolloProvider } from "@apollo/client";
import Link from "next/link";
import { useRouter } from "next/router";

import { useApollo } from "../lib/apolloClient";

import LoginControl from "../components/LoginControl";
import { colours } from "../lib/colours";
import { useQuery } from "@ts-gql/apollo";
import { AUTHED_USER } from "../lib/queries";
import { Button } from "../components/design-system/Button";
import { useState } from "react";

const pageColour = "#dcdcd8";

const Page = (props) => (
  <div
    css={{
      maxWidth: 640,
      margin: "auto",
    }}
    {...props}
  />
);

const linkCss = {
  paddingRight: 8,
  paddingLeft: 8,
  height: "100%",
  color: colours.grey900,
  cursor: "pointer",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 60,
  textDecoration: "none",
  backgroundColor: colours.grey100,
  borderLeft: `1px solid ${colours.red800}`,
  borderRight: `1px solid ${colours.red800}`,
  ":hover": {
    backgroundColor: colours.grey200,
  },
  ":active": {
    backgroundColor: colours.green300,
  },
};

const AdminLink = (props) => <a css={linkCss} {...props} />;

const HeaderLink = ({ href, ...rest }) => (
  <Link passHref href={href}>
    <a css={linkCss} {...rest} />
  </Link>
);

const Header = () => {
  let { data } = useQuery(AUTHED_USER);
  let [showLogIn, toggleShowLogin] = useState(false);

  return (
    <div
      css={{
        height: 52,
        backgroundColor: colours.red900,
        color: colours.grey200,
      }}
    >
      <div css={{ display: "flex", alignItems: "center", height: "100%" }}>
        <div css={{ width: 24 }} />
        <HeaderLink href="/">Home</HeaderLink>
        <HeaderLink href="/battle">Battles</HeaderLink>
        <HeaderLink href="/maths-hammer">Maths Hammer</HeaderLink>
        <AdminLink href="/admin">Admin</AdminLink>
        <div css={{ marginLeft: "auto", marginRight: 16 }}>
          {data &&
            (data.authenticatedUser ? (
              <LoginControl />
            ) : (
              <Button onClick={() => toggleShowLogin(true)}>Log in</Button>
            ))}
          {showLogIn && (
            <div
              css={{
                position: "absolute",
                backgroundColor: "white",
                top: "54px",
                margin: "auto",
                left: "calc(60% - 50px)",
              }}
            >
              <LoginControl />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const OddInterstitialThing = (props) => (
  <div
    css={{
      backgroundColor: pageColour,
      minHeight: "calc(100vh - 52px)",
    }}
  >
    <div css={{ padding: 24 }} {...props} />
  </div>
);

const Content = (props) => {
  const { pathname } = useRouter();

  const { data } = useQuery(AUTHED_USER);

  if (!data) return null;

  if (!data?.authenticatedUser?.id && pathname !== "/") {
    return (
      <OddInterstitialThing>
        You are logged out! You'll need to log in to view this page
      </OddInterstitialThing>
    );
  }
  return <OddInterstitialThing {...props} />;
};

const AppComponent = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <>
      <Global
        styles={css`
          body {
            margin: 0px;
            background-color: ${colours.grey50};
          }
        `}
      />
      {/* @ts-ignore */}
      <ApolloProvider client={apolloClient}>
        <Page>
          <Header />
          <Content>
            <Component {...pageProps} />
          </Content>
        </Page>
      </ApolloProvider>
    </>
  );
};

export default AppComponent;
