import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'rs-login-warning',
  templateUrl: './login-warning.component.html',
})
export class LoginWarningComponent {
  public constructor(
    private router: Router,
    private dialogRef: MatDialogRef<LoginWarningComponent>,
  ) {
  }

  public gotoLogin() {
    this.dialogRef.close();
    this.router.navigate(['/login']);
  }
}
