export const enum Skill {
  Attack = 0,
  Defence = 1,
  Strength = 2,
  Constitution = 3,
  Ranged = 4,
  Prayer = 5,
  Magic = 6,
  Cooking = 7,
  Woodcutting = 8,
  Fletching = 9,
  Fishing = 10,
  Firemaking = 11,
  Crafting = 12,
  Smithing = 13,
  Mining = 14,
  Herblore = 15,
  Agility = 16,
  Thieving = 17,
  Slayer = 18,
  Farming = 19,
  Runecrafting = 20,
  Hunter = 21,
  Construction = 22,
  Summoning = 23,
  Dungeoneering = 24,
  Divination = 25,
  Invention = 26,
}

export interface SkillValue {
  id: Skill;
  level: number;
  rank: number;
  xp: number;
}
