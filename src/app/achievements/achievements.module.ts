import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatCheckboxModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatTableModule,
} from '@angular/material';

import { DialogsModule } from '../dialogs/dialogs.module';

import { AchievementFormComponent } from './achievement-form/achievement-form.component';
import { AchievementListComponent } from './achievement-list/achievement-list.component';
import { AchievementGridComponent } from './achievement-grid/achievement-grid.component';
import { AchievementCategoriesComponent } from './achievement-categories/achievement-categories.component';

@NgModule({
  imports: [
    CommonModule,
    DialogsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AchievementFormComponent,
    AchievementGridComponent,
    AchievementListComponent,
    AchievementCategoriesComponent,
  ],
})
export class AchievementsModule {
}
