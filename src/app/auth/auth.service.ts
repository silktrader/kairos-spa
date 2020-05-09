import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, first, catchError } from 'rxjs/operators';
import { UserInfo } from './user-info.model';
import { AuthConfig } from './auth-config.model';

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

  constructor(config: AuthConfig, private readonly http: HttpClient) {
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

  signin(email: string, password: string): Observable<UserInfo | undefined> {
    return this.http
      .post<UserInfo>(this.backendUrl + 'signin', {
        email,
        password,
      })
      .pipe(
        first(),
        catchError((error) => {
          console.log(error); // tk
          return of(undefined);
        }),
        map((userInfo: UserInfo) => {
          // login successful if there's a jwt token in the response
          // tk perform validation of response?
          if (userInfo) {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            localStorage.setItem(this.userKeyName, JSON.stringify(userInfo));
            this.userSubject$.next(userInfo);
            return userInfo;
          }

          return undefined;
        })
      );
  }

  signout() {
    // remove user from local storage to log user out
    localStorage.removeItem(this.userKeyName);
    this.userSubject$.next(null);
  }

  register(name: string, password: string): Observable<void> {
    return this.http.post<void>(this.backendUrl + 'signup', {
      Name: name,
      Password: password,
    });
  }
}
