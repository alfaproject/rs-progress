import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatCheckboxChange, PageEvent } from '@angular/material';

import { AchievementService } from '../achievement.service';
import { UserAchievement } from '../achievement.interface';
import { tap, finalize } from 'rxjs/operators';
import { UserAchievementsDataSource } from './user-achievements-data-source';

@Component({
  selector: 'achievement-grid',
  templateUrl: './achievement-grid.component.html',
  styleUrls: ['./achievement-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementGridComponent {
  dataSource: UserAchievementsDataSource;
  displayedColumns: string[];
  expandedAchievements = new Map<string, boolean>();
  toggling = false;

  private _category: any;
  private _type: string;

  constructor(
    private achievementService: AchievementService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
  }

  public get type() {
    return this._type;
  }

  @Input()
  public set type(value: string) {
    this._type = value;
    this.dataSource = new UserAchievementsDataSource(this.achievementService, value);

    this.displayedColumns = value === 'rs'
      ? ['completed', 'runescore', 'name']
      : ['completed', 'name'];
  }

  public get category() {
    return this._category;
  }

  @Input()
  public set category(value: any) {
    this._category = value;
    this.dataSource.loadCategory(value);
    this.dataSource.setPage(0, 200);
  }

  toggleAchievementTable(achievement: UserAchievement) {
    this.toggling = true;
    this.achievementService.toggleAchievement(achievement.reference, !achievement.completed)
      .pipe(
        finalize(() => {
          this.toggling = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe();
  }

  toggleHideCompleted($event: MatCheckboxChange) {
    this.dataSource.setHideCompleted($event.checked);
  }

  changePage(page: PageEvent) {
    this.dataSource.setPage(page.pageIndex, page.pageSize);
  }

  isExpanded(achievement: UserAchievement) {
    return this.expandedAchievements.get(achievement.slug);
  }

  toggleExpand(achievement: UserAchievement) {
    this.expandedAchievements.set(achievement.slug, !this.isExpanded(achievement));
  }

  trackByUid(index: number, achievement: UserAchievement) {
    return achievement.id;
  }
}
