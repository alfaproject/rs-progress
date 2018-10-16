// tslint:disable-next-line:no-implicit-dependencies
import { DocumentReference, DocumentData } from '@google-cloud/firestore';
import { createHash } from 'crypto';
import * as admin from 'firebase-admin';

const firestore = admin.firestore();

export async function toggleAchievement(userId: string, achievementId: string, completed: boolean) {
  const ops: Array<[DocumentReference, DocumentData]> = [];
  await toggleAchievementTree(userId, achievementId, completed, ops);
  for (let i = 0; i < ops.length; i += 500) {
    const batch = firestore.batch();
    for (let j = i; j < i + 500 && j < ops.length; j++) {
      const [docRef, docData] = ops[j];
      if (docData) {
        batch.set(docRef, docData);
      } else {
        batch.delete(docRef);
      }
    }
    await batch.commit();
  }
}

async function toggleAchievementTree(userId: string, achievementId: string, completed: boolean, ops: Array<[DocumentReference, DocumentData]>) {
  const userAchievementId = sha256(userId + achievementId);
  const userAchievementDoc = firestore.collection('userAchievements').doc(userAchievementId);
  if (completed) {
    // Add user achievement
    ops.push([userAchievementDoc, {
      userId,
      achievementId,
    }])
  } else {
    // Delete user achievement
    ops.push([userAchievementDoc, null]);
  }

  // Update sub-achievements if they exist
  const achievementDoc = await firestore.doc(`achievements/${achievementId}`).get();
  const subAchievementRefs: DocumentReference[] = achievementDoc.get('achievements') || [];
  await Promise.all(subAchievementRefs.map(subAchievementRef => {
    return toggleAchievementTree(userId, subAchievementRef.id, completed, ops);
  }));
}

function sha256(data: string | Buffer | DataView) {
  return createHash('sha256')
    .update(data)
    .digest('hex');
}
