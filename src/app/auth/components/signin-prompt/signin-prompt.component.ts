import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-signin-prompt',
  templateUrl: './signin-prompt.component.html',
  styleUrls: ['./signin-prompt.component.scss'],
})
export class SigninPromptComponent implements OnInit {
  readonly username = new FormControl(undefined, [Validators.required]);
  readonly password = new FormControl(undefined, [Validators.required]);
  readonly signinForm = new FormGroup({
    username: this.username,
    password: this.password,
  });

  private readonly returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  passwordVisible = false;
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly as: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  attemptSignin(): void {
    const { username, password } = this.signinForm.value;
    this.loading$.next(true);
    this.as
      .signin(username, password)
      .pipe(first())
      .subscribe(
        (user) => {
          this.loading$.next(false);
          if (user) this.router.navigate([this.returnUrl]);
        },
        (error) => {
          // clear the input
          this.password.reset();
          this.password.setErrors({ wrongCredentials: true });
          this.loading$.next(false);
        }
      );
  }
}
