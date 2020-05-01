import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-general-error-dialog',
  templateUrl: './general-error-dialog.component.html',
  styleUrls: ['./general-error-dialog.component.scss'],
})
export class GeneralErrorDialogComponent implements OnInit, AfterViewInit {
  disableAnimation = true;
  constructor(@Inject(MAT_DIALOG_DATA) public error: Error) {}

  ngOnInit(): void {}

  // Workaround for angular component issue #13870
  ngAfterViewInit(): void {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
    setTimeout(() => (this.disableAnimation = false));
  }
}
