import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ScheduleState } from 'src/app/store/schedule';
import { Store } from '@ngrx/store';
import { addHabit } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-add-habit-dialog',
  templateUrl: './add-habit-dialog.component.html',
  styleUrls: ['./add-habit-dialog.component.scss'],
})
export class AddHabitDialogComponent implements OnInit {
  readonly detailsFormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    colour: [''], // tk change
  });

  readonly appearanceFormGroup = this.fb.group({
    colour: ['', Validators.required],
    rank: ['', Validators.required],
  });

  readonly startFormGroup = this.fb.group({
    start: ['', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly store: Store<ScheduleState>
  ) {}

  ngOnInit(): void {}

  saveHabit(): void {
    this.store.dispatch(
      addHabit({
        habit: {
          ...this.detailsFormGroup.value,
          ...this.appearanceFormGroup.value,
        },
      })
    );
  }
}
