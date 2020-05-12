import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-authentication-prompt',
  templateUrl: './authentication-prompt.component.html',
  styleUrls: ['./authentication-prompt.component.scss'],
})
export class AuthenticationPromptComponent implements OnInit {
  private returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

  constructor(
    private readonly as: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {}

  handleSignin(credentials: { email: string; password: string }): void {
    this.as
      .signin(credentials.email, credentials.password)
      .pipe(first())
      .subscribe((user) => {
        if (user) this.router.navigate([this.returnUrl]);
      });
  }
}
