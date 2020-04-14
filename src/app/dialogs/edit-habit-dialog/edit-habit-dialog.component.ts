import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HabitDto } from 'src/app/models/dtos/habit.dto';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { updateHabit } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-edit-habit-dialog',
  templateUrl: './edit-habit-dialog.component.html',
  styleUrls: ['./edit-habit-dialog.component.scss'],
})
export class EditHabitDialogComponent implements OnInit {
  readonly habitGroup = this.fb.group({
    title: [undefined],
    description: [undefined],
    colour: [undefined],
  });

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public habit: HabitDto,
    private readonly store: Store<AppState>
  ) {}

  ngOnInit(): void {
    if (this.habit) {
      this.habitGroup.patchValue(this.habit);
    }
  }

  updateHabit(): void {
    this.store.dispatch(
      updateHabit({ habit: { ...this.habitGroup.value, id: this.habit.id } })
    );
  }
}
