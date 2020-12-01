const { Color } = require("@keystonejs/fields-color");
const { Markdown } = require("@keystonejs/fields-markdown");
const { access } = require("./access");

const {
  Text,
  Checkbox,
  Password,
  Select,
  Relationship,
  Integer,
  CalendarDay,
} = require("@keystonejs/fields");

const {
  battlefieldRoles,
  factions,
  missionTypes,
  battleStatuses,
  objectToOptions,
} = require("./constants");

module.exports.User = {
  fields: {
    name: { type: Text, isRequired: true, isUnique: true },
    email: {
      type: Text,
      isUnique: true,
      isRequired: true,
    },
    isAdmin: {
      type: Checkbox,
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
    armies: { type: Relationship, ref: "Army.owner", many: true },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
};

module.exports.Army = {
  fields: {
    name: { type: Text, isRequired: true, isUnique: true },
    description: { type: Markdown },
    armyRules: { type: Markdown },
    faction: { type: Select, options: factions, dataType: "string" },
    units: { type: Relationship, ref: "Unit.army", many: true },
    owner: { type: Relationship, ref: "User.armies" },
    primaryColor: { type: Color },
    secondaryColor: { type: Color },
    highlightColor: { type: Color },
  },
  adminConfig: {
    defaultColumns: "label,faction,owner,primaryColor,secondaryColor",
  },
};

module.exports.Unit = {
  fields: {
    name: { type: Text },
    points: { type: Integer },
    army: { type: Relationship, ref: "Army.units" },
    battleFieldRole: {
      type: Select,
      options: battlefieldRoles,
      dataType: "string",
    },
  },
};

module.exports.Battle = (keystone) => ({
  fields: {
    army1: { type: Relationship, ref: "BattleInfo" },
    army2: { type: Relationship, ref: "BattleInfo" },
    points: { type: Integer },
    mission: { type: Relationship, ref: "Mission" },
    setupDescription: { type: Markdown },
    description: { type: Markdown },
    status: {
      type: Select,
      options: objectToOptions(battleStatuses),
    },
    playDate: { type: CalendarDay },
  },
  labelResolver: async ({ id, playDate }) => {
    let { data } = await keystone.executeGraphQL({
      query: `query {
        Battle(where: {id: ${id}}) {
          army1 {
            _label_
          }
          army2 {
            _label_
          }
        }
      }`,
    });

    let date = new Date(playDate);

    return `${data.Battle.army1._label_} v ${
      data.Battle.army2._label_
    } (${date.toLocaleDateString("en-AU")})`;
  },
});

module.exports.BattleInfo = (keystone) => ({
  fields: {
    army: { type: Relationship, ref: "Army" },
    primary: { type: Relationship, ref: "Objective" },
    secondaries: { type: Relationship, ref: "Objective", many: true },
    CP: { type: Integer, defaultValue: 0 },
    notes: { type: Markdown },
  },
  labelResolver: async ({ army }) => {
    let { data } = await keystone.executeGraphQL({
      query: `query {
        Army(where: {id: ${army}}) {
          name
        }
      }`,
    });

    return data.Army.name;
  },
});

module.exports.Mission = {
  fields: {
    name: { type: Text },
    source: { type: Text },
    type: { type: Text },
    page: { type: Integer },
    briefing: { type: Markdown },
    forceSize: {
      type: Select,
      options: Object.entries(missionTypes).map(([value, { label }]) => ({
        value,
        label,
      })),
    },
    rules: { type: Markdown },
    primary: { type: Relationship, ref: "ObjectiveOption" },
    secondary: { type: Relationship, ref: "ObjectiveOption" },
    // TODO: I would love to get scans of the maps in here
    // battleLayout: { type: Image },
  },
};

module.exports.ObjectiveOption = {
  fields: {
    name: { type: Text },
    category: { type: Text },
    rules: { type: Markdown },
    source: { type: Text },
    scoreType: {
      default: "single",
      type: Select,
      options: [
        { value: "single", label: "Single" },
        { value: "perTurn", label: "Per Turn" },
        { value: "checkbox", label: "Set amount" }, // goal - display an appropriate number of checkboxes aka 'Assassinate' provides 5
        { value: "divideByTen", label: "Divide By Ten" }, // thin their ranks
      ],
    },
    checkboxVal: { type: Integer },
  },
};

module.exports.Objective = {
  fields: {
    name: { type: Text },
    score: { type: Integer },
    turn1: { type: Integer },
    turn2: { type: Integer },
    turn3: { type: Integer },
    turn4: { type: Integer },
    turn5: { type: Integer },
    selection: { type: Relationship, ref: "ObjectiveOption" },
  },
};

/*
Future lists:

List - a list linked to an army with units and a points value
Maybe link List to a battle?
Conceptually, you link all your units to your army, and then you select from units in your army to make a list quickly
This leads to a whole lot more flows though, so lots more pages
*/
