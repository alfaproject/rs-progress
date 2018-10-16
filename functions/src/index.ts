import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
admin.initializeApp();

import { runescapeSync as runescapeSyncInternal } from './runescape-sync-function';
import { toggleAchievement as toggleAchievementInternal } from './toggle-achievement';

export const toggleAchievement = functions.https.onCall((data, context) => {
  return toggleAchievementInternal(context.auth.uid, data.achievementId, data.completed);
});

export const runescapeSync = runescapeSyncInternal;
