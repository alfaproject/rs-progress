import { Component } from '@angular/core';

import { AuthService } from '../core/auth.service';

@Component({
  selector: 'user-upgrade',
  templateUrl: './user-upgrade.component.html',
  styleUrls: ['./user-upgrade.component.scss'],
})
export class UserUpgradeComponent {

  public constructor(
    private auth: AuthService,
  ) {
  }

  public submit(user: { email: string, password: string }) {
    this.auth.convertAnonymousUser(user.email, user.password);
  }
}
