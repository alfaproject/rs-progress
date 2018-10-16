import { Injectable, ChangeDetectorRef } from '@angular/core';
import { MatSidenav } from '@angular/material';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private sidenav: MatSidenav;
  private changeDetector: ChangeDetectorRef;

  public register(sidenav: MatSidenav, changeDetector: ChangeDetectorRef) {
    this.sidenav = sidenav;
    this.changeDetector = changeDetector;
  }

  public exists() {
    return !!this.sidenav;
  }

  public unregister() {
    this.sidenav = null;
    this.changeDetector = null;
  }

  public close() {
    this.sidenav.close();
    this.changeDetector.markForCheck();
  }

  public toggle() {
    this.sidenav.toggle();
    this.changeDetector.markForCheck();
  }
}
