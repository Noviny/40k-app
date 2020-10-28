const { createItems } = require("@keystonejs/server-side-graphql-client");
const fs = require("fs");

const initialData = {
  User: [
    {
      name: "Noviny",
      email: "noviny@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `Nova'eir`,
          description: "My main army",
          faction: "T'au",
          primaryColor: "rgba(119, 65, 191, 1)",
          secondaryColor: "rgba(232, 235, 40, 1)",
        },
      },
    },
    {
      name: "Mark",
      email: "mark@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `Some Orks probably`,
          description: "An army of passion",
          faction: "Orks",
          primaryColor: "rgba(246, 0, 0, 1)",
          secondaryColor: "rgba(82, 133, 56, 1)",
        },
      },
    },
    {
      name: "Tom",
      email: "tom@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `DOOM`,
          description: "An army of passion",
          faction: "Death Guard",
        },
      },
    },
    {
      name: "Sam",
      email: "sam@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `Knights`,
          description: "An army of passion",
          faction: "Grey Knights",
        },
      },
    },
    {
      name: "Matt",
      email: "matt@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `Not traitors`,
          description: "An army of passion",
          faction: "Dark Angels",
        },
      },
    },
    {
      name: "Peter",
      email: "peter@warhammer-stuff.com",
      isAdmin: true,
      password: "password",
      armies: {
        create: {
          name: `Dreams of future`,
          description: "An army of passion",
          faction: "Custodes",
        },
      },
    },
  ],
};

async function createInitialData(keystone) {
  if (!process.env.RECREATE_DATABASE) return;
  let schema = keystone.dumpSchema();
  fs.writeFileSync("./schema.graphql", schema);

  let newItems = Object.entries(initialData);

  await Promise.all(
    newItems.map(([listKey, listData]) =>
      createItems({
        keystone,
        listKey,
        items: listData.map((x) => ({ data: x })),
      })
    )
  );
}

module.exports = createInitialData;
