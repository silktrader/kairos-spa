import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-signin-prompt',
  templateUrl: './signin-prompt.component.html',
  styleUrls: ['./signin-prompt.component.scss'],
})
export class SigninPromptComponent implements OnInit {
  @Output() attemptedSignin = new EventEmitter<{
    email: string;
    password: string;
  }>();

  readonly email = new FormControl(undefined, [
    Validators.required,
    Validators.email,
  ]);
  readonly password = new FormControl(undefined, [Validators.required]);
  readonly signinForm = new FormGroup({
    email: this.email,
    password: this.password,
  });

  passwordVisible = false;

  constructor() {}

  ngOnInit(): void {}

  attemptSignin() {
    this.attemptedSignin.emit(this.signinForm.value);
  }
}
