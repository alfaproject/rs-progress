import * as functions from 'firebase-functions';
import fetch from 'node-fetch';

import { SkillValue } from './skill.interface';
import { SKILLS_LEVELS_ACHIEVEMENTS_MAP, SKILLS_200M_XP_ACHIEVEMENTS_MAP } from './skills-levels-achievements-map';
import { toggleAchievement } from './toggle-achievement';

export const runescapeSync = functions.https.onCall(async (data, context) => {
  const userId = context.auth.uid;

  const rsProfile = await fetchRsProfile(data.rsn);
  await toggleSkillAchievements(userId, rsProfile.skillvalues);
});

function fetchRsProfile(rsn: string) {
  return fetch(`https://apps.runescape.com/runemetrics/profile/profile?user=${rsn}&activities=20`)
    .then(res => res.json());
}

async function toggleSkillAchievements(userId: string, skillValues: SkillValue[]) {
  for (const skillValue of skillValues) {
    // Do we have level achievements for this skill?
    if (SKILLS_LEVELS_ACHIEVEMENTS_MAP[skillValue.id]) {
      const skillLevelsAchievementsMap = SKILLS_LEVELS_ACHIEVEMENTS_MAP[skillValue.id];

      // Find the highest level achievement
      for (let level = skillValue.level; level > 0; level--) {
        if (skillLevelsAchievementsMap[level]) {
          await toggleAchievement(userId, skillLevelsAchievementsMap[level], true);
          break;
        }
      }
    }

    // 200m achievements
    if (skillValue.xp === 200000000 && SKILLS_200M_XP_ACHIEVEMENTS_MAP[skillValue.id]) {
      await toggleAchievement(userId, SKILLS_200M_XP_ACHIEVEMENTS_MAP[skillValue.id], true);
    }
  }

  // Friends with Max (all 99s)
  if (skillValues.every(s => s.level >= 99)) {
    await toggleAchievement(userId, 'r2k6kO02tzCcP3bxNox2', true);
  }

  // Skill Till You Drop! (200m all skills)
  if (skillValues.every(s => s.xp >= 200000000)) {
    await toggleAchievement(userId, 'SV8JgsLWZN9CN8y1YTHZ', true);
  }

  // Master Skiller (max total)
  if (skillValues.reduce((total, skill) => total + skill.level, 0) === 2736) {
    await toggleAchievement(userId, 'OYDraWIIa1ElFo5EDBhw', true);
  }
}
