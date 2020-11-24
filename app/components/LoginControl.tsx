/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useMutation, useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import { useState } from "react";
import Router from "next/router";

import { Input } from "../components/design-system/Input";
import { Button } from "../components/design-system/Button";
import { AUTHED_USER } from "../lib/queries";

const AUTH_USER = gql`
  mutation signin($email: String, $password: String) {
    authenticate: authenticateUserWithPassword(
      email: $email
      password: $password
    ) {
      item {
        id
        name
      }
    }
  }
` as import("../../__generated__/ts-gql/signin").type;

const LOG_OUT = gql`
  mutation unauthUser {
    unauthenticateUser {
      success
    }
  }
` as import("../../__generated__/ts-gql/unauthUser").type;

const LoggedIn = ({ name }) => {
  const [logOut] = useMutation(LOG_OUT);

  return (
    <div>
      <span css={{ paddingRight: 8 }}>{name}</span>
      <Button
        css={{ padding: 4 }}
        onClick={() => {
          logOut().then(() => {
            Router.reload();
          });
        }}
      >
        Log out
      </Button>
    </div>
  );
};

const LogIn = () => {
  const [authUser] = useMutation(AUTH_USER);
  const [email, updateEmail] = useState("");
  const [password, updatePassword] = useState("");

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          authUser({
            variables: {
              email,
              password,
            },
          }).then(() => Router.reload());
        }}
      >
        <Input
          label="Email"
          type="text"
          id="email"
          name="email"
          value={email}
          onChange={({ target }) => updateEmail(target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          id="pass"
          onChange={({ target }) => updatePassword(target.value)}
          value={password}
          name="password"
          minLength={8}
          required
        />
        <div
          css={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 4,
          }}
        >
          <div />
          <input css={{ padding: 4 }} type="submit" value="Sign in" />
        </div>
      </form>
    </div>
  );
};

const UserState = () => {
  const { data } = useQuery(AUTHED_USER);

  if (!data) return null;
  if (data.authenticatedUser) {
    return <LoggedIn name={data.authenticatedUser.name} />;
  }

  return <LogIn />;
};

const Blocks = () => (
  <div css={{ display: "flex", justifyContent: "space-between" }}>
    <div></div>
    <UserState />
  </div>
);

export default Blocks;
