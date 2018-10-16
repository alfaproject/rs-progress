import { Component, ViewChild, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSidenav } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DocumentReference, DocumentData } from '@firebase/firestore-types';
import { Observable, of, from } from 'rxjs';
import { map, tap, first, pluck, switchMap } from 'rxjs/operators';

import { PlatformService } from '../../core/platform.service';
import { SidenavService } from '../../core/sidenav.service';

@Component({
  selector: 'achievement-categories',
  templateUrl: './achievement-categories.component.html',
  styleUrls: ['./achievement-categories.component.scss'],
})
export class AchievementCategoriesComponent implements OnDestroy {
  categories$: Observable<any[]>;
  loadingCategories = true;
  selectedCategory: any = null;
  type$: Observable<string>;

  public constructor(
    public platform: PlatformService,
    private sidenavService: SidenavService,
    afs: AngularFirestore,
    activateRoute: ActivatedRoute,
  ) {
    this.type$ = activateRoute.data.pipe(pluck('type'));

    const categoriesCollection = afs.collection<any>('categories');
    this.categories$ = this.type$
      .pipe(
        switchMap(type => {
          return categoriesCollection.valueChanges()
            .pipe(
              map(categories => categories.filter(category => category.categories && category.types.includes(type))),
              tap(categories => {
                categories.forEach(category => {
                  if (category.categories) {
                    category.categories$ = loadReferences(category.categories)
                      .pipe(
                        map(subCategories => subCategories.filter(subCategory => subCategory.types.includes(type))),
                      );
                  }
                });
                this.loadingCategories = false;
              }),
            );
        }),
      );
  }

  @ViewChild(MatSidenav)
  public set sidenav(value: MatSidenav) {
    this.sidenavService.register(value);
  }

  public ngOnDestroy() {
    this.sidenavService.unregister();
  }

  public loadCategory(category: any) {
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

function loadReferences(references: DocumentReference[] | undefined): Observable<DocumentData[]> {
  return references
    ? from(Promise.all(references.map(ref => ref.get().then(snapshot => {
        const doc = snapshot.data();
        doc.reference = ref;
        return doc;
      }))))
    : of([]);
}
