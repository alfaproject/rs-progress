import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, map, shareReplay, first } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { FunctionService } from '../core/function.service';
import { LoginWarningComponent } from '../dialogs/login-warning/login-warning.component';

import { Achievement, UserAchievement } from './achievement.interface';
import { Category } from './category.interface';

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const parenthesisRegex = /^\([^)]+\) /;

@Injectable({
  providedIn: 'root',
})
export class AchievementService {
  public readonly categories$: Observable<Category[]>;
  public readonly achievements$: Observable<Achievement[]>;
  public readonly userAchievements$: Observable<UserAchievement[]>;

  public constructor(
    private functionService: FunctionService,
    private authService: AuthService,
    private dialog: MatDialog,
    afs: AngularFirestore,
  ) {
    // Set up achievements
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

    // Set up user achievements
    const fsUserAchievements$ = authService.user
      .pipe(
        switchMap(user => {
          if (!user) {
            return of([]);
          }

          const userAchievementsCollection = afs.collection<any>(
            'userAchievements',
            ref => ref.where('userId', '==', user.uid),
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
              completed: userAchievements.some(fsua => fsua.achievementId === achievement.id),
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

    // Set up categories
    this.categories$ = afs
      .collection('categories')
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions
            .map(action => {
              const categoryDoc = action.payload.doc;
              const category = categoryDoc.data() as Category;
              category.id = categoryDoc.id;
              category.reference = categoryDoc.ref;

              if (category.categories) {
                category.categories$ = this.categories$
                  .pipe(
                    map(categories => category.categories.map(cRef => categories.find(c => c.reference.isEqual(cRef)))),
                  );
              }

              if (category.achievements) {
                category.achievements$ = this.achievements$
                  .pipe(
                    map(achievements => achievements.filter(a => category.achievements.some(ar => ar.isEqual(a.reference)))),
                  );
              }

              return category;
            });
        }),
        shareReplay(1),
      );
  }

  public toggleAchievement(achievement: UserAchievement): Observable<void> {
    return this.authService.user
      .pipe(
        first(),
        switchMap(user => {
          if (!user) {
            this.dialog.open(LoginWarningComponent);
            return of();
          }

          achievement.completed = !achievement.completed;
          return this.functionService.call('toggleAchievement', {
            achievementId: achievement.id,
            completed: achievement.completed,
          });
        }),
      );
  }
}
