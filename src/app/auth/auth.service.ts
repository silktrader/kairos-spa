import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, first } from 'rxjs/operators';
import { UserInfo } from './user-info.model';
import { AuthConfig } from './auth-config.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly backendUrl: string;
  private readonly userKeyName: string;

  // will be set to null when local storage isn't initialised
  private readonly userSubject$: BehaviorSubject<UserInfo | null>;

  // expose the user subject but negate the ability to emit new values
  public readonly user$: Observable<UserInfo | null>;

  constructor(
    config: AuthConfig,
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.backendUrl = config.backendUrl;
    this.userKeyName = config.userKeyName ?? 'user';

    // must attempt to fetch the keys after their name is defined
    const userKeyName = localStorage.getItem(this.userKeyName);
    this.userSubject$ = new BehaviorSubject<UserInfo | null>(
      userKeyName ? JSON.parse(userKeyName) : null
    );
    this.user$ = this.userSubject$.asObservable();
  }

  public get user(): UserInfo | null {
    return this.userSubject$.value;
  }

  signin(username: string, password: string): Observable<UserInfo | undefined> {
    return this.http
      .post<UserInfo>(this.backendUrl + 'signin', {
        username,
        password,
      })
      .pipe(
        first(),
        map((userInfo: UserInfo) => {
          // store user details and jwt token in local storage to keep user logged in
          localStorage.setItem(this.userKeyName, JSON.stringify(userInfo));
          this.userSubject$.next(userInfo);
          return userInfo;
        })
      );
  }

  signout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.userKeyName);
    this.userSubject$.next(null);
    this.router.navigate(['/user']);
  }

  register(name: string, password: string): Observable<void> {
    return this.http.post<void>(this.backendUrl + 'signup', {
      Name: name,
      Password: password,
    });
  }
}
