import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlatformService {
  public isNarrowScreen$: Observable<boolean>;

  public constructor(
    breakpointObserver: BreakpointObserver,
  ) {
    this.isNarrowScreen$ = breakpointObserver
      .observe(Breakpoints.XSmall)
      .pipe(
        map(breakpoint => breakpoint.matches),
      );
  }
}
