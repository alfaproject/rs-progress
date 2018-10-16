import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { Observable, Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap, debounceTime } from 'rxjs/operators';

import { UserAchievement } from '../achievement.interface';
import { AchievementService } from '../achievement.service';
import { UserAchievementStats } from './user-achievement-stats.interface';

export class UserAchievementsDataSource implements DataSource<UserAchievement> {
  public loading$: Observable<boolean> = new BehaviorSubject<boolean>(false);
  public stats$: Observable<UserAchievementStats> = new BehaviorSubject<UserAchievementStats>({
    total: 0,
    completed: 0,
    totalRuneScore: 0,
    completedRuneScore: 0,
    filteredTotal: 0,
  });

  private category$ = new BehaviorSubject<any>(null);
  private hideCompleted$ = new BehaviorSubject<boolean>(false);
  private page$ = new BehaviorSubject<[number, number]>([0, 200]);

  public constructor(
    private achievementService: AchievementService,
    private type: string,
  ) {
  }

  public connect(collectionViewer: CollectionViewer): Observable<UserAchievement[]> {
    return combineLatest(
        this.achievementService.userAchievements$,
        this.category$,
        this.hideCompleted$,
        this.page$,
      )
      .pipe(
        debounceTime(50),
        map(([achievements, category, hideCompleted, page]) => {
          // console.log(category, achievements);
          achievements = achievements.filter(a => a.type === this.type);

          // Apply the category filter
          if (category) {
            // const o = [];
            // const ca = category.achievements.map(caRef => {
            //   const achievement = achievements.find(a => a.reference.isEqual(caRef));
            //   o.push(`achievements/${achievement.id}\t${achievement.runescore}\t${achievement.name}`);
            //   return achievement;
            // });
            // console.log(o.join('\n'));
            // return ca;
            // console.log(category);
            achievements = achievements.filter(a => category.achievements.some(ar => ar.isEqual(a.reference)));
          }

          // Compute the stats for this category
          const completedAchievements = achievements.filter(a => a.completed);
          const stats: UserAchievementStats = {
            total: achievements.length,
            completed: completedAchievements.length,
            totalRuneScore: achievements.reduce((score, achievement) => score + achievement.runescore, 0),
            completedRuneScore: completedAchievements.reduce((score, achievement) => score + achievement.runescore, 0),
            filteredTotal: 0,
          };

          // Apply the rest of the filters
          if (hideCompleted) {
            achievements = achievements.filter(a => !a.completed);
          }

          // Emit the stats
          stats.filteredTotal = achievements.length;
          (this.stats$ as Subject<UserAchievementStats>).next(stats);

          const [pageIndex, pageSize] = page;
          return achievements.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
        }),
        tap(() => (this.loading$ as BehaviorSubject<boolean>).next(false)),
      );
  }

  public disconnect(collectionViewer: CollectionViewer): void {
    this.category$.complete();
    this.hideCompleted$.complete();
    this.page$.complete();
    (this.stats$ as BehaviorSubject<UserAchievementStats>).complete();
    (this.loading$ as BehaviorSubject<boolean>).complete();
  }

  public loadCategory(category: any) {
    (this.loading$ as BehaviorSubject<boolean>).next(true);
    this.category$.next(category);
  }

  public setHideCompleted(value: boolean) {
    (this.loading$ as BehaviorSubject<boolean>).next(true);
    this.hideCompleted$.next(value);
  }

  public setPage(pageIndex: number, pageSize: number) {
    (this.loading$ as BehaviorSubject<boolean>).next(true);
    this.page$.next([pageIndex, pageSize]);
  }
}
