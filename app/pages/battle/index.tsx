/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useQuery } from "@ts-gql/apollo";
import { gql } from "@ts-gql/tag";
import Link from "next/link";
import { palette } from "../../../palette";
import { battleStatuses } from "../../../constants";
import { getScore } from "../../lib/utilities";
import { Button } from "../../components/design-system/Button";
import { colours } from "../../lib/colours";

const fragment = gql`
  fragment Army_info_2 on BattleInfo {
    id
    primary {
      id
      score
    }
    secondaries {
      id
      score
    }
    army {
      id
      faction
      name
      owner {
        id
        name
      }
    }
  }
` as import("../../../__generated__/ts-gql/Army_info_2").type;

const GET_BATTLES = gql`
  query getAllBattles {
    allBattles {
      id
      status
      army1 {
        ...Army_info_2
      }
      army2 {
        ...Army_info_2
      }
    }
  }
` as import("../../../__generated__/ts-gql/getAllBattles").type;

const TD = ({ styles = {}, ...rest }) => (
  <td {...rest} css={{ padding: 8, ...styles }} />
);

const TR = (props) => (
  <tr
    css={{
      borderBottom: `2px solid ${palette.neutral500}`,
      ":nth-of-type(even)": {
        backgroundColor: colours.neutral100,
      },
      ":nth-of-type(odd)": {
        backgroundColor: colours.neutral200,
      },
    }}
    {...props}
  />
);

const TH = (props) => <th {...props} css={{ padding: 8 }} />;

const Row = ({ p1, p1Score, p2, p2Score, status, id }) => (
  <TR>
    <TD>{p1}</TD>
    <TD css={{ textAlign: "center" }}>{p1Score}</TD>
    <TD>{p2}</TD>
    <TD css={{ textAlign: "center" }}>{p2Score}</TD>
    <TD>{battleStatuses[status]}</TD>
    <TD>
      <Link href={`/battle/${id}`}>
        <a>view battle</a>
      </Link>
    </TD>
  </TR>
);

const Table = ({ battles }) => {
  return (
    <table
      css={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}
    >
      <thead>
        <tr
          css={{
            borderBottom: `4px solid ${palette.neutral900}`,
          }}
        >
          <TH>Player 1</TH>
          <TH>(score)</TH>
          <TH>Player 2</TH>
          <TH>(score)</TH>
          <TH>Status</TH>
          <TH>Link</TH>
        </tr>
      </thead>
      <tbody>
        {battles.map(({ army1, army2, status, id }) => (
          <Row
            key={id}
            p1={army1.army.owner.name}
            p1Score={getScore(army1)}
            p2Score={getScore(army2)}
            p2={army2.army.owner.name}
            status={status}
            id={id}
          />
        ))}
      </tbody>
    </table>
  );
};

const BattleList = () => {
  const { data, error } = useQuery(GET_BATTLES);

  if (error) {
    if (error.graphQLErrors.find(({ name }) => name === "AccessDeniedError")) {
      return (
        <div>We are probably logged out - please log in and try again</div>
      );
    }
    return <div>some kind of error occurred here: {JSON.stringify(error)}</div>;
  }
  if (!data) {
    return <div>Loading...</div>;
  }

  const sortedBattles = [...data.allBattles].sort(
    // sort first to put in progress at the top
    (a, b) => (b.status === "inProgress" && a.status !== "inProgress" ? 1 : 0)
  );
  // show a table of relevant info for each battle
  return (
    <div>
      <Table battles={sortedBattles} />
    </div>
  );
};

const Page = () => (
  <>
    <div
      css={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1>List of Battles:</h1>
      <Button href="/battle/create">Create a new battle</Button>
    </div>
    <BattleList />
  </>
);

export default Page;
