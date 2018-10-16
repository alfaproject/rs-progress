import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService, User } from '../core/auth.service';
import { FunctionService } from '../core/function.service';

@Component({
  selector: 'rs-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  public user$: Observable<User>;
  public loading$ = new Subject<boolean>();

  public constructor(
    private authService: AuthService,
    private functionService: FunctionService,
  ) {
    this.user$ = authService.user;
  }

  public syncRsn(rsn: string) {
    this.loading$.next(true);
    forkJoin(
      this.authService
        .updateUser({
          rsn,
          photoURL: `https://secure.runescape.com/m=avatar-rs/${rsn}/chat.png`,
        }),
      this.functionService.call('runescapeSync', { rsn }),
    )
    .pipe(
      finalize(() => this.loading$.next(false)),
    )
    .subscribe();
  }
}
