const { withTsGql } = require("@ts-gql/next");
const withPreconstruct = require("@preconstruct/next");

module.exports = withTsGql(
  withPreconstruct({
    env: {
      apolloURL: process.env.apolloURL || "http://localhost:3000",
    },
  })
);
