import {
  BrowserModule,
  BrowserTransferStateModule
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

// App Modules
import { CoreModule } from './core/core.module';
import { UiModule } from './ui/ui.module';
import { NotesModule } from './notes/notes.module';
import { AchievementsModule } from './achievements/achievements.module';

// AngularFire2 Modules
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule, MatMenuModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule } from '@angular/material';
import { HomePageComponent } from './home-page/home-page.component';
import { UserUpgradeComponent } from './user-upgrade/user-upgrade.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    UserUpgradeComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    AppRoutingModule,
    CoreModule,
    UiModule,
    NotesModule,
    AngularFireModule.initializeApp(environment.firebase, 'rs-progress'),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireFunctionsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production
    }),
    BrowserAnimationsModule,
    MatSidenavModule,
    MatMenuModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    AchievementsModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
