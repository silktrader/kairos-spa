import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { HabitDto } from 'src/app/habits/models/habit.dto';
import { AddHabitDialogComponent } from 'src/app/habits/components/add-habit-dialog/add-habit-dialog.component';
import { EditHabitDialogComponent } from 'src/app/habits/components/edit-habit-dialog/edit-habit-dialog.component';
import { HabitsState } from 'src/app/habits/state/habits.state';
import { selectHabits } from 'src/app/habits/state/habits.selectors';

@Component({
  selector: 'app-habits-sidebar',
  templateUrl: './habits-sidebar.component.html',
  styleUrls: ['./habits-sidebar.component.scss'],
})
export class HabitsSidebarComponent implements OnInit {
  habits$ = this.store.pipe(select(selectHabits));
  constructor(
    private readonly store: Store<HabitsState>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  public openAddHabitDialog() {
    this.dialog.open(AddHabitDialogComponent, {
      panelClass: 'kairos-dialog',
    });
  }

  public openEditHabitDialog(habit: HabitDto) {
    this.dialog.open(EditHabitDialogComponent, {
      panelClass: 'kairos-dialog',
      data: habit,
    });
  }
}
