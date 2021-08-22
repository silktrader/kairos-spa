import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup-prompt',
  templateUrl: './signup-prompt.component.html',
  styleUrls: [
    '../signin-prompt/signin-prompt.component.scss',
    './signup-prompt.component.scss',
  ],
})
export class SignupPromptComponent implements OnInit {
  readonly username = new FormControl(undefined, [Validators.required]);
  readonly password = new FormControl(undefined, [Validators.required]);
  readonly email = new FormControl(undefined, [
    Validators.required,
    Validators.email,
  ]);
  readonly signupForm = new FormGroup({
    username: this.username,
    email: this.email,
    password: this.password,
  });

  private readonly returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  readonly loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly as: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  attemptSignUp(): void {
    const { username, email, password } = this.signupForm.value;
    this.loading$.next(true);
    this.as.signUp(username, email, password).subscribe(
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
