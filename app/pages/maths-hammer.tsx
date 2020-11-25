/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useState } from "react";
import { Button } from "../components/design-system/Button";
import { Input } from "../components/design-system/Input";

const round = (num) => Math.round((num + Number.EPSILON) * 100) / 100;

const getNum = (dice, required) => {
  if (required < 2) required = 2;

  let successes = round(dice * ((7 - required) / 6));

  return {
    successes,
    failures: dice - successes,
    perNumber: round(dice * (1 / 6)),
  };
};

const Checkbox = ({ checked, onChange, label, text }) => (
  <span css={{ padding: 8 }}>
    <label htmlFor={label} css={{ display: "inline-block" }}>
      {text}
    </label>
    <input
      name={label}
      id={label}
      type="checkbox"
      checked={checked}
      onChange={() => onChange(!checked)}
    />
  </span>
);

const getToWound = (strength, toughness) => {
  let num = strength / toughness;

  if (num >= 2) {
    return 2;
  } else if (num > 1) {
    return 3;
  }
  if (num === 1) {
    return 4;
  } else if (num <= 0.5) {
    return 6;
  } else {
    return 5;
  }
};

const mathsHammer = (
  {
    shots = 1,
    toHit = 4,
    strength = 5,
    AP = 0,
    weaponDamage = 1,
    vsToughness = 4,
    vsArmour = 3,
    vsInvuln = 7,
    shrug = 7,
    enemyWounds = 1,
    ...rest
  } = {},
  {
    reroll1sToHit = false,
    reroll1sToWound = false,
    rerollFailedWounds = false,
    rerollMisses = false,
    bonusToHit = 0,
    bonusToWound = 0,
    extraHitsOn6s = false,
    mortalWoundsOn6s = false,
    extraAttackRollOn6s = false,
    autoWoundOn6s = false,
  } = {}
) => {
  let mortalWounds = 0;

  toHit = toHit - bonusToHit > 6 ? 6 : toHit - bonusToHit;

  let { successes: hits, failures: misses, perNumber } = getNum(shots, toHit);

  if (rerollMisses) {
    let {
      successes: addHits,
      failures: addMisses,
      perNumber: newPerNumber,
    } = getNum(misses, toHit);
    hits += addHits;
    misses += addMisses;
    perNumber += newPerNumber;
  } else if (reroll1sToHit) {
    let {
      successes: addHits,
      failures: addMisses,
      perNumber: newPerNumber,
    } = getNum(perNumber, toHit);
    hits += addHits;
    misses += addMisses;
    perNumber += newPerNumber;
  }

  // TODO: check if this triggers off rerolls or not, as well as if this can be rerolled...
  // Currently it triggers off rerolls but these dice will not be rerolled if needed
  if (extraAttackRollOn6s) {
    let {
      successes: addHits,
      failures: addMisses,
      perNumber: newPerNumber,
    } = getNum(perNumber, toHit);
    hits += addHits;
    misses += addMisses;
    perNumber += newPerNumber;
  }

  if (extraHitsOn6s) {
    hits += perNumber;
  }
  let toWound = getToWound(strength, vsToughness) - bonusToWound;

  toWound = toWound > 6 ? 6 : toWound;

  let {
    successes: wounds,
    failures: failToWound,
    perNumber: woundPerNumber,
  } = getNum(hits, toWound);

  if (rerollFailedWounds) {
    let {
      successes: addWounds,
      failures: addWoundFailures,
      perNumber: addWoundPerNumber,
    } = getNum(woundPerNumber, toWound);
    wounds += addWounds;
    failToWound += addWoundFailures;
    woundPerNumber += addWoundPerNumber;
  } else if (reroll1sToWound) {
    let {
      successes: addWounds,
      failures: addWoundFailures,
      perNumber: addWoundPerNumber,
    } = getNum(woundPerNumber, toWound);
    wounds += addWounds;
    failToWound += addWoundFailures;
    woundPerNumber += addWoundPerNumber;
  }

  if (mortalWoundsOn6s) {
    mortalWounds += woundPerNumber;
  }

  let modifiedArmourSave = vsArmour - AP;

  let saveNeeded =
    modifiedArmourSave < vsInvuln ? modifiedArmourSave : vsInvuln;

  let { successes: passedSaves, failures: damage } = getNum(wounds, saveNeeded);

  let failedSaves = damage;
  let modelsKilled = 0;

  damage = damage * weaponDamage;

  damage += mortalWounds;

  let woundsToKill = Math.ceil(enemyWounds / weaponDamage);

  modelsKilled = failedSaves / woundsToKill;

  if (shrug < 7) {
    let { failures } = getNum(damage, shrug);

    damage = failures;
  }

  return {
    hits: round(hits),
    wounds: round(wounds),
    damage: round(damage),
    mortalWounds: round(mortalWounds),
    modelsKilled: round(modelsKilled),
  };
};

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const AttackerBlock = ({
  index,
  values,
  updateValue,
  disableRemoveButton,
  removeBlock,
}) => {
  return (
    <div>
      <h2>Unit {alphabet[index]}</h2>
      <Button disabled={disableRemoveButton} onClick={removeBlock}>
        -
      </Button>
      <AttackerStats
        {...values}
        changeShots={(newVal) => updateValue("shots", newVal)}
        changeAP={(newVal) => updateValue("AP", newVal)}
        changeStrength={(newVal) => updateValue("strength", newVal)}
        changeToHit={(newVal) => updateValue("toHit", newVal)}
        changeWeaponDamage={(newVal) => updateValue("weaponDamage", newVal)}
      />
    </div>
  );
};

const AttackerStats = ({
  shots,
  changeShots,
  toHit,
  changeToHit,
  strength,
  changeStrength,
  AP,
  changeAP,
  weaponDamage,
  changeWeaponDamage,
}) => (
  <div>
    <Input
      label="# shots"
      min={1}
      type="number"
      value={shots}
      onChange={({ target }) => changeShots(parseInt(target.value))}
    />
    <Input
      min={2}
      max={6}
      label="to hit"
      type="number"
      value={toHit}
      onChange={({ target }) => changeToHit(parseInt(target.value))}
    />
    <Input
      label="strength"
      type="number"
      value={strength}
      onChange={({ target }) => changeStrength(parseInt(target.value))}
    />
    <Input
      max={0}
      label="AP"
      type="number"
      value={AP}
      onChange={({ target }) => changeAP(parseInt(target.value))}
    />
    <Input
      min={0}
      label="Weapon Damage"
      type="number"
      value={weaponDamage}
      onChange={({ target }) => changeWeaponDamage(parseInt(target.value))}
    />
  </div>
);

const DefenderBlock = ({
  index,
  values: { vsToughness, vsArmour, vsInvuln, shrug, enemyWounds },
  updateValue,
  disableRemoveButton,
  removeBlock,
}) => {
  return (
    <div>
      <h2>Unit {index + 1}</h2>
      <Button disabled={disableRemoveButton} onClick={removeBlock}>
        -
      </Button>
      {/* <DefenderStats
        {...values}
        changeVsToughness={(newVal) => updateValue("vsToughness", newVal)}
        changeArmour={(newVal) => updateValue("vsArmour", newVal)}
        changeVsInvuln={(newVal) => updateValue("vsInvuln", newVal)}
        changeShrug={(newVal) => updateValue("shrug", newVal)}
        changeEnemyWounds={(newVal) => updateValue("enemyWounds", newVal)}
      /> */}

      <Input
        label="Toughness"
        type="number"
        value={vsToughness}
        onChange={({ target }) =>
          updateValue("vsToughness", parseInt(target.value))
        }
      />
      <Input
        label="Wounds"
        type="number"
        value={enemyWounds}
        onChange={({ target }) =>
          updateValue("enemyWounds", parseInt(target.value))
        }
      />
      <Input
        min={2}
        max={6}
        label="Armour"
        type="number"
        value={vsArmour}
        onChange={({ target }) =>
          updateValue("vsArmour", parseInt(target.value))
        }
      />
      <Input
        min={2}
        max={7}
        label="Invulnerable"
        type="number"
        value={vsInvuln}
        onChange={({ target }) =>
          updateValue("vsInvuln", parseInt(target.value))
        }
      />
      <Input
        min={2}
        max={7}
        label="Shrug"
        type="number"
        value={shrug}
        onChange={({ target }) => updateValue("shrug", parseInt(target.value))}
      />
    </div>
  );
};

const defaultDefenderBlock = {
  vsInvuln: 7,
  enemyWounds: 1,
  vsArmour: 3,
  vsToughness: 4,
  shrug: 7,
};
const defaultAttackerBlock = {
  shots: 10,
  toHit: 4,
  strength: 5,
  AP: 0,
  weaponDamage: 1,
};

const Result = ({
  attackerValues,
  defenderValues,
  special,
  attacker,
  defender,
}) => {
  const { hits, wounds, damage, mortalWounds, modelsKilled } = mathsHammer(
    { ...attackerValues, ...defenderValues },
    special
  );
  return (
    <div>
      <h3>
        {attacker} Vs {defender}
      </h3>
      <p>Hits: {hits}</p>
      <p>Wounds: {wounds}</p>
      <p>Damage: {damage}</p>
      <p>Mortal Wounds: {mortalWounds}</p>
      <p>
        Models killed: {modelsKilled} (this number is a bit fuzzy - also it
        doesn't work with shrugs or mortal wounds)
      </p>
    </div>
  );
};

const Page = () => {
  const [reroll1sToHit, changereroll1sToHit] = useState(false);
  const [reroll1sToWound, changereroll1sToWound] = useState(false);
  const [rerollFailedWounds, changererollFailedWounds] = useState(false);
  const [rerollMisses, changererollMisses] = useState(false);
  const [bonusToHit, changebonusToHit] = useState(0);
  const [bonusToWound, changebonusToWound] = useState(0);
  const [extraHitsOn6s, changeextraHitsOn6s] = useState(false);
  const [mortalWoundsOn6s, changemortalWoundsOn6s] = useState(false);
  const [extraAttackRollOn6s, changeextraAttackRollOn6s] = useState(false);

  const [defenderBlocks, updateDefenderBlocks] = useState([
    { ...defaultDefenderBlock },
  ]);
  const [attackerBlocks, updateAttackerBlocks] = useState([
    { ...defaultAttackerBlock },
  ]);

  const special = {
    reroll1sToHit,
    reroll1sToWound,
    rerollFailedWounds,
    rerollMisses,
    bonusToHit,
    bonusToWound,
    extraHitsOn6s,
    mortalWoundsOn6s,
    extraAttackRollOn6s,
  };

  return (
    <div>
      <h1>Maths Hammer</h1>
      <h2>Attacker Profile</h2>
      <Button disabled={true}>Load unit info</Button>
      <Button
        onClick={() =>
          updateAttackerBlocks([...attackerBlocks, { ...defaultAttackerBlock }])
        }
      >
        +
      </Button>
      {attackerBlocks.map((values, index) => (
        <AttackerBlock
          key={index}
          values={values}
          index={index}
          disableRemoveButton={attackerBlocks.length < 2}
          removeBlock={() =>
            updateAttackerBlocks([...attackerBlocks].splice(index, 1))
          }
          updateValue={(key, value) =>
            updateAttackerBlocks(
              attackerBlocks.map((block, i) => {
                if (i === index) {
                  block[key] = value;
                }
                return block;
              })
            )
          }
        />
      ))}
      <h2>Defender profile</h2>
      <Button disabled={true}>Load unit info</Button>
      <Button
        onClick={() =>
          updateDefenderBlocks([...defenderBlocks, { ...defaultDefenderBlock }])
        }
      >
        +
      </Button>
      {defenderBlocks.map((values, index) => (
        <DefenderBlock
          key={index}
          values={values}
          index={index}
          disableRemoveButton={defenderBlocks.length < 2}
          removeBlock={() =>
            updateDefenderBlocks([...defenderBlocks].splice(index, 1))
          }
          updateValue={(key, value) =>
            updateDefenderBlocks(
              defenderBlocks.map((block, i) => {
                if (i === index) {
                  block[key] = value;
                }
                return block;
              })
            )
          }
        />
      ))}
      <h2>Other Modifiers</h2>
      <Input
        type="number"
        value={bonusToHit}
        label="bonus to hit"
        onChange={({ target }) => changebonusToHit(parseInt(target.value))}
      />
      <Input
        type="number"
        value={bonusToWound}
        label="bonus to wound"
        onChange={({ target }) => changebonusToWound(parseInt(target.value))}
      />
      <Checkbox
        checked={reroll1sToHit}
        label="reroll1sToHit"
        text="reroll 1s to hit"
        onChange={changereroll1sToHit}
      />
      <Checkbox
        checked={rerollMisses}
        label="rerollMisses"
        text="reroll misses"
        onChange={changererollMisses}
      />
      <Checkbox
        checked={extraAttackRollOn6s}
        label="extraAttackRollOn6s"
        text="extra attack roll on 6s"
        onChange={changeextraAttackRollOn6s}
      />
      <Checkbox
        checked={extraHitsOn6s}
        label="extraHitsOn6s"
        text="extra hits on6s"
        onChange={changeextraHitsOn6s}
      />
      <Checkbox
        checked={reroll1sToWound}
        label="reroll1sToWound"
        text="reroll 1s to wound"
        onChange={changereroll1sToWound}
      />
      <Checkbox
        checked={rerollFailedWounds}
        label="rerollFailedWounds"
        text="reroll failed wounds"
        onChange={changererollFailedWounds}
      />
      <Checkbox
        checked={mortalWoundsOn6s}
        label="mortalWoundsOn6s"
        text="mortal wounds on 6s"
        onChange={changemortalWoundsOn6s}
      />
      <h2>Results</h2>
      {attackerBlocks.map((attackerValues, ai) =>
        defenderBlocks.map((defenderValues, di) => (
          <Result
            key={`${ai}=${di}`}
            attackerValues={attackerValues}
            defenderValues={defenderValues}
            special={special}
            attacker={alphabet[ai]}
            defender={di + 1}
          />
        ))
      )}
    </div>
  );
};

export default Page;
