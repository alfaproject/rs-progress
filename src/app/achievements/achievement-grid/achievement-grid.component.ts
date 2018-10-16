import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatCheckboxChange, PageEvent } from '@angular/material';
import { finalize } from 'rxjs/operators';

import { AchievementService } from '../achievement.service';
import { UserAchievement } from '../achievement.interface';
import { Category } from '../category.interface';

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

  private _category: Category;
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
  public set category(value: Category) {
    this._category = value;
    this.dataSource.loadCategory(value);
    this.dataSource.setPage(0, 100);
  }

  toggleAchievementTable($event: Event, achievement: UserAchievement) {
    $event.preventDefault();

    this.toggling = true;
    this.achievementService
      .toggleAchievement(achievement)
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
    return this.expandedAchievements.get(achievement.id);
  }

  toggleExpand(achievement: UserAchievement) {
    this.expandedAchievements.set(achievement.id, !this.isExpanded(achievement));
  }

  trackById(index: number, achievement: UserAchievement) {
    return achievement.id;
  }
}
