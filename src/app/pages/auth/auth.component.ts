import { Component, OnInit } from '@angular/core';
import { AuthService, UserInfo } from 'auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {}

  handleSignin(credentials: { email: string; password: string }): void {
    this.authService
      .signin(credentials.email, credentials.password)
      .subscribe();
  }
}
