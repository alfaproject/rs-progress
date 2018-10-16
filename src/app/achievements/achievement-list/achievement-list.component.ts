import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatSelectionListChange } from '@angular/material';

import { AchievementService } from '../achievement.service';
import { UserAchievement } from '../achievement.interface';

@Component({
  selector: 'achievement-list',
  templateUrl: './achievement-list.component.html',
  styleUrls: ['./achievement-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementListComponent {
  @Input() achievements: any[];

  constructor(
    private achievementService: AchievementService,
  ) {
  }

  toggleSelection($event: MatSelectionListChange) {
    const option = $event.option;
    const achievement: UserAchievement = option.value;
    this.achievementService.toggleAchievement(achievement.reference, option.selected).subscribe();
  }
}
