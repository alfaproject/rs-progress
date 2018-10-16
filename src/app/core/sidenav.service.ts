import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private sidenav: MatSidenav;

  public register(sidenav: MatSidenav) {
    this.sidenav = sidenav;
  }

  public exists() {
    return !!this.sidenav;
  }

  public unregister() {
    this.sidenav = null;
  }

  public close() {
    this.sidenav.close();
  }

  public toggle() {
    this.sidenav.toggle();
  }
}
