import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatSelectionListChange } from '@angular/material';
import { Subject } from 'rxjs';

import { AchievementService } from '../achievement.service';
import { UserAchievement } from '../achievement.interface';

@Component({
  selector: 'achievement-list',
  templateUrl: './achievement-list.component.html',
  styleUrls: ['./achievement-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementListComponent {
  achievements$ = new Subject<UserAchievement[]>();

  constructor(
    private achievementService: AchievementService,
  ) {
  }

  @Input() set achievements(value: UserAchievement[]) {
    if (value) {
      this.achievements$.next(value);
    }
  }

  toggleSelection($event: MatSelectionListChange) {
    const option = $event.option;
    const achievement: UserAchievement = option.value;
    this.achievementService.toggleAchievement(achievement).subscribe();
  }

  trackById(index: number, achievement: UserAchievement) {
    return achievement.id;
  }
}
