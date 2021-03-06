import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HabitDto } from 'src/app/habits/models/habit.dto';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { HabitsState } from '../../state/habits.state';
import { deleteHabit, editHabit } from '../../state/habits.actions';

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

  editingHabit$ = this.store.select((state) => state.editingHabit);
  saveable$ = new BehaviorSubject(false);

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public habit: HabitDto,
    private readonly store: Store<HabitsState>
  ) {}

  ngOnInit(): void {
    // tk unregister subscriptions
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
