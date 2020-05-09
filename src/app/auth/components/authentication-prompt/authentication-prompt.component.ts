import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-authentication-prompt',
  templateUrl: './authentication-prompt.component.html',
  styleUrls: ['./authentication-prompt.component.scss'],
})
export class AuthenticationPromptComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {}

  handleSignin(credentials: { email: string; password: string }): void {
    this.authService
      .signin(credentials.email, credentials.password)
      .subscribe();
  }
}
