const costs = 165 * 2 + 74 * 3 + 90 * 2 + 85 + 66 * 2 + 85;

console.log(costs);

// const abilityCost = [0, 0, 4, 10, 20, 35, 55, 80];

// const skillCost = [0, 2, 6, 12, 20, 30, 42];

// const freeXP = abilityCost[3] + skillCost[2] + skillCost[1];
// const spendableXP = 107 + freeXP;

// const abilities = {
//   strength: 2,
//   toughness: 3,
//   agility: 3,
//   initiative: 3,
//   willpower: 3,
//   intelligence: 4,
//   fellowship: 1,
// };

// const skills = {
//   athletics: 0,
//   awareness: 3,
//   ballisticSkill: 3,
//   cunning: 0,
//   deception: 0,
//   insight: 1,
//   intimidation: 0,
//   investigation: 1,
//   leadership: 0,
//   medicae: 2,
//   persuasion: 0,
//   pilot: 0,
//   psychicMastery: 0,
//   scholar: 2,
//   stealth: 0,
//   survival: 0,
//   tech: 4,
//   weaponSkill: 0,
// };

// const getXP = () => {
//   const xpOnAbilities = Object.values(abilities).reduce(
//     (e, n) => e + abilityCost[n],
//     0
//   );
//   const xpOnSkills = Object.values(skills).reduce(
//     (e, n) => e + skillCost[n],
//     0
//   );
//   const remainingXP = spendableXP - (xpOnAbilities + xpOnSkills);
//   console.log("spent on abilities:", xpOnAbilities - 10);
//   console.log("spent on skill:", xpOnSkills - 8);
//   console.log("remaining:", remainingXP);
// };

// getXP();

// const mealPlan = [
//   { day: "all", snacks: ["apple"], drinks: "" },
//   {
//     day: "Monday",
//     breakfast: "N/A",
//     lunch: "lasagna",
//     dinner: "",
//   },
//   {
//     day: "Tuesday",
//     breakfast: "porridge",
//     lunch: "lasagna",
//     dinner: "burrito bowl",
//   },
//   {
//     day: "Wednesday",
//     breakfast: "porridge",
//     lunch: "lasagna",
//     dinner: "pasta",
//   },
//   {
//     day: "Thursday",
//     breakfast: "porridge",
//     lunch: "",
//     dinner: "pasta",
//   },
//   {
//     day: "Friday",
//     breakfast: "porridge",
//     lunch: "zeus street greek",
//     dinner: "",
//   },
//   {
//     day: "Saturday",
//     breakfast: "",
//     lunch: "",
//     dinner: "",
//   },
//   {
//     day: "Sunday",
//     breakfast: "",
//     lunch: "",
//     dinner: "",
//   },
// ];
