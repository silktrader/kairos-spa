import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'kv-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  @Output() attemptedSignin = new EventEmitter<{
    email: string;
    password: string;
  }>();

  readonly email = new FormControl(undefined, [
    Validators.required,
    Validators.email
  ]);
  readonly password = new FormControl(undefined, [Validators.required]);
  readonly signinForm = new FormGroup({
    email: this.email,
    password: this.password
  });

  passwordVisible = false;

  constructor() {}

  ngOnInit(): void {}

  attemptSignin() {
    this.attemptedSignin.emit(this.signinForm.value);
  }
}
