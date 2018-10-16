import { Component } from '@angular/core';

import { AuthService } from './core/auth.service';
import { PlatformService } from './core/platform.service';
import { SidenavService } from './core/sidenav.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public constructor(
    public auth: AuthService,
    public platform: PlatformService,
    public sidenav: SidenavService,
  ) {
  }
}
