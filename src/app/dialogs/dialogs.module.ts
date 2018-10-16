import { NgModule } from '@angular/core';
import { MatDialogModule, MatButtonModule } from '@angular/material';
import { RouterModule } from '@angular/router';

import { LoginWarningComponent } from './login-warning/login-warning.component';

@NgModule({
  imports: [
    MatButtonModule,
    MatDialogModule,
    RouterModule,
  ],
  exports: [
    MatDialogModule,
  ],
  declarations: [
    LoginWarningComponent,
  ],
  entryComponents: [
    LoginWarningComponent,
  ],
})
export class DialogsModule {
}
