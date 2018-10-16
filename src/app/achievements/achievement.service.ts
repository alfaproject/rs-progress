import { Injectable } from '@angular/core';
import { AngularFirestore, DocumentReference, AngularFirestoreDocument } from '@angular/fire/firestore';
import { WriteBatch } from '@firebase/firestore-types';
import { switchMap, first, map, shareReplay, mergeMap, tap } from 'rxjs/operators';
import { Observable, combineLatest, of, from, forkJoin } from 'rxjs';

import { AuthService } from '../core/auth.service';
import { Achievement, UserAchievement } from './achievement.interface';

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const parenthesisRegex = /^\([^)]+\) /;

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  public readonly achievements$: Observable<Achievement[]>;
  public readonly userAchievements$: Observable<UserAchievement[]>;

  public constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
  ) {
    this.achievements$ = afs
      .collection('achievements')
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions
            .map(action => {
              const achievement = action.payload.doc.data() as Achievement;
              achievement.id = action.payload.doc.id;
              achievement.reference = action.payload.doc.ref;
              if (achievement.achievements) {
                achievement.achievements$ = this.achievements$
                  .pipe(
                    map(achievements => achievements.filter(a => achievement.achievements.some(ar => ar.isEqual(a.reference)))),
                  );
              }
              return achievement;
            })
            .sort((a1, a2) => {
              const a1Name = a1.name.replace(parenthesisRegex, '');
              const a2Name = a2.name.replace(parenthesisRegex, '');
              return collator.compare(a1Name, a2Name);
            });
        }),
        shareReplay(1),
      );

    const fsUserAchievements$ = authService.user
      .pipe(
        switchMap(user => {
          if (!user) {
            return of([]);
          }

          const userRef = afs.doc(`users/${user.uid}`).ref;
          const userAchievementsCollection = afs.collection<any>(
            'userAchievements',
            ref => ref.where('userId', '==', userRef),
          );
          return userAchievementsCollection.valueChanges();
        }),
      );

    this.userAchievements$ = combineLatest(
        this.achievements$,
        fsUserAchievements$,
      )
      .pipe(
        map(([achievements, userAchievements]) => {
          return achievements.map(achievement => {
            const userAchievement: UserAchievement = {
              ...achievement,
              completed: userAchievements.some(fsua => fsua.achievementId.isEqual(achievement.reference)),
            };
            if (userAchievement.achievements) {
              userAchievement.achievements$ = this.userAchievements$
                .pipe(
                  map(uas => uas.filter(a => userAchievement.achievements.some(ar => ar.isEqual(a.reference)))),
                );
            }
            return userAchievement;
          });
        }),
      );

    // const achievements = [];
    // this.setCategoryAchievements('completionist-quest-m', achievements);
  }

  public toggleAchievement(achievementRef: DocumentReference, completed: boolean) {
    const batch = this.afs.firestore.batch();
    return this.toggleAchievementInternal(achievementRef, completed, batch)
      .pipe(
        mergeMap(() => from(batch.commit())),
      );
  }

  private toggleAchievementInternal(achievementRef: DocumentReference, completed: boolean, batch: WriteBatch): Observable<void> {
    return this.authService.user
      .pipe(
        first(),
        switchMap(user => {
          const userRef = this.afs.doc(`users/${user.uid}`).ref;
          return this.afs.collection(
              'userAchievements',
              ref => ref
                .where('userId', '==', userRef)
                .where('achievementId', '==', achievementRef)
                .limit(1),
            )
            .snapshotChanges()
            .pipe(
              first(),
              switchMap(actions => {
                const userAchievementRefs = actions.map(a => a.payload.doc.ref);
                if (completed && userAchievementRefs.length < 1) {
                  const userAchievementCollectionRef = this.afs.collection('userAchievements').ref;
                  const userAchievementDoc = new AngularFirestoreDocument<any>(userAchievementCollectionRef.doc(), this.afs);
                  batch.set(userAchievementDoc.ref, {
                    userId: userRef,
                    achievementId: achievementRef,
                  });
                } else if (!completed && userAchievementRefs.length > 0) {
                  batch.delete(userAchievementRefs[0]);
                }

                // Get sub-achievements
                return from(achievementRef.get().then(achievementSnapshot => {
                  const achievement = achievementSnapshot.data() as Achievement;
                  return achievement.achievements || [];
                }));
              }),
              mergeMap(achievementRefs => {
                // Update sub-achievements if they exist
                return achievementRefs.length
                  ? forkJoin(achievementRefs.map(aRef => this.toggleAchievementInternal(aRef, completed, batch)))
                  : of(null);
              }),
            );
        }),
      );
  }

  setCategoryAchievements(categoryId: string, achievementIds: string[]) {
    const category = this.afs.doc<any>(`categories/${categoryId}`);
    const achievements = achievementIds.map(id => this.afs.doc<Achievement>(`achievements/${id}`).ref);
    category
      .update({
        achievements,
      })
      .then(() => console.log('Category achievements set'));
  }
}
