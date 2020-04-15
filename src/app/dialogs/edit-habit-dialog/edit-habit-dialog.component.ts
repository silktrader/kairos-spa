import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HabitDto } from 'src/app/models/dtos/habit.dto';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { editHabit, deleteHabit } from 'src/app/store/schedule.actions';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-edit-habit-dialog',
  templateUrl: './edit-habit-dialog.component.html',
  styleUrls: ['./edit-habit-dialog.component.scss'],
})
export class EditHabitDialogComponent implements OnInit {
  readonly habitGroup = this.fb.group({
    title: [
      this.habit.title,
      [Validators.required, Validators.minLength(5), Validators.maxLength(30)],
    ],
    description: this.habit.description,
    colour: this.habit.colour,
  });

  editingHabit$ = this.store.select((state) => state.schedule.editingHabit);
  saveable$ = new BehaviorSubject(false);

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public habit: HabitDto,
    private readonly store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.habitGroup.valueChanges.subscribe((value) => {
      this.saveable$.next(this.formHasChanged(value));
    });
  }

  formHasChanged(value: HabitDto): boolean {
    if (
      value.title !== this.habit.title ||
      value.description !== this.habit.description ||
      value.colour !== this.habit.colour
    ) {
      return true;
    }
    return false;
  }

  editHabit(): void {
    this.store.dispatch(
      editHabit({ habit: { ...this.habitGroup.value, id: this.habit.id } })
    );
  }

  deleteHabit(): void {
    this.store.dispatch(deleteHabit({ habit: this.habit }));
  }
}
