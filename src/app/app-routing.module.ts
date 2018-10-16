import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './core/auth.guard';
import { UserLoginComponent } from './ui/user-login/user-login.component';
import { NotesListComponent } from './notes/notes-list/notes-list.component';
import { AchievementFormComponent } from './achievements/achievement-form/achievement-form.component';
import { AchievementCategoriesComponent } from './achievements/achievement-categories/achievement-categories.component';
import { HomePageComponent } from './home-page/home-page.component';
import { UserUpgradeComponent } from './user-upgrade/user-upgrade.component';
import { AccountComponent } from './account/account.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'upgrade', component: UserUpgradeComponent },
  { path: 'account', component: AccountComponent },
  // { path: 'notes', component: NotesListComponent, canActivate: [AuthGuard] },
  { path: 'achievements', component: AchievementCategoriesComponent, data: { type: 'rs' } },
  { path: 'true-trim', component: AchievementCategoriesComponent, data: { type: 'tt' } },

  { path: 'achievement/:id', component: AchievementFormComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class AppRoutingModule {
}
