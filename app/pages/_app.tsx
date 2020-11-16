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

const Page = (props) => (
  <div
    css={{
      maxWidth: 640,
      margin: "auto",
    }}
    {...props}
  />
);

const AdminLink = (props) => (
  <a
    css={{
      paddingRight: 8,
      paddingLeft: 8,
      height: "100%",
      color: colours.grey900,
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: 60,
      backgroundColor: colours.grey100,
      borderLeft: `1px solid ${colours.red800}`,
      borderRight: `1px solid ${colours.red800}`,
    }}
    {...props}
  />
);

const HeaderLink = ({ href, ...rest }) => (
  <Link href={href}>
    <a
      css={{
        paddingRight: 8,
        paddingLeft: 8,
        height: "100%",
        color: colours.grey900,
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 60,
        backgroundColor: colours.grey100,
        borderLeft: `1px solid ${colours.red800}`,
        borderRight: `1px solid ${colours.red800}`,
      }}
      {...rest}
    />
  </Link>
);

const Header = () => (
  <div
    css={{
      height: 92,
      backgroundColor: colours.red700,
      color: colours.grey200,
    }}
  >
    <div css={{ display: "flex", alignItems: "center", height: "100%" }}>
      <HeaderLink href="/">Hoem</HeaderLink>
      <HeaderLink href="/battle">Battels</HeaderLink>
      <AdminLink href="/admin">Admine</AdminLink>
      <div css={{ marginLeft: "auto", marginRight: 16 }}>
        <LoginControl />
      </div>
    </div>
  </div>
);

const Content = (props) => {
  const { pathname } = useRouter();

  const { data } = useQuery(AUTHED_USER);

  if (!data) return null;

  if (!data?.authenticatedUser?.id && pathname !== "/")
    return (
      <div css={{ backgroundColor: "white", padding: 24 }}>
        You are logged out! You'll need to log in to view this page
      </div>
    );
  return <div css={{ backgroundColor: "white", padding: 24 }} {...props} />;
};

const AppComponent = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <>
      <Global
        styles={css`
          body {
            margin: 0px;
            background-color: ${colours.grey500};
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
