export const AI_LEVELS = [
  { max: 800, label: "Debutant" },
  { max: 1200, label: "Intermediaire" },
  { max: 1800, label: "Avance" },
  { max: 2400, label: "Maitre" },
  { max: 3300, label: "Grand maitre" },
];

export function getLevelLabel(elo, levels = AI_LEVELS) {
  const level = levels.find((entry) => elo <= entry.max) ?? levels.at(-1);
  return level?.label ?? "Personnalise";
}

