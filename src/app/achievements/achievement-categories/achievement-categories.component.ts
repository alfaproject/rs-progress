import { Component, ViewChild, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { map, tap, first, pluck, switchMap } from 'rxjs/operators';

import { PlatformService } from '../../core/platform.service';
import { SidenavService } from '../../core/sidenav.service';

import { AchievementService } from '../achievement.service';
import { Category } from '../category.interface';

@Component({
  selector: 'achievement-categories',
  templateUrl: './achievement-categories.component.html',
  styleUrls: ['./achievement-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AchievementCategoriesComponent implements OnDestroy {
  categories$: Observable<Category[]>;
  loadingCategories$ = new Subject<boolean>();
  selectedCategory: Category = null;
  type$: Observable<'rs' | 'tt'>;

  public constructor(
    public platform: PlatformService,
    private achievementService: AchievementService,
    private changeDetector: ChangeDetectorRef,
    private sidenavService: SidenavService,
    activateRoute: ActivatedRoute,
  ) {
    this.type$ = activateRoute.data.pipe(pluck('type'));
    this.categories$ = this.type$
      .pipe(
        tap(() => this.loadingCategories$.next(true)),
        switchMap(type => {
          return this.achievementService.categories$
            .pipe(
              map(categories => categories.filter(category => category.categories && category.types.includes(type))),
              tap(categories => {
                categories.forEach(category => {
                  if (category.categories) {
                    category.categories$ = achievementService.categories$
                      .pipe(
                        map(subCategories => category.categories.map(cRef => subCategories.find(c => c.reference.isEqual(cRef)))),
                        map(subCategories => subCategories.filter(subCategory => subCategory.types.includes(type))),
                      );
                  }
                });
                this.loadingCategories$.next(false);
              }),
            );
        }),
      );
  }

  @ViewChild(MatSidenav)
  public set sidenav(value: MatSidenav) {
    this.sidenavService.register(value, this.changeDetector);
  }

  public ngOnDestroy() {
    this.sidenavService.unregister();
  }

  public loadCategory(category: Category) {
    this.selectedCategory = category;

    // Close sidebar if we have a narrow screen
    this.platform.isNarrowScreen$
      .pipe(
        first(),
        tap(isNarrowScreen => {
          if (isNarrowScreen) {
            this.sidenavService.close();
          }
        })
      )
      .subscribe();
  }
}
