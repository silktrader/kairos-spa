import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { selectHabits } from 'src/app/store/schedule.selectors';
import { HabitDto } from 'src/app/habits/models/habit.dto';
import { AddHabitDialogComponent } from 'src/app/habits/components/add-habit-dialog/add-habit-dialog.component';
import { EditHabitDialogComponent } from 'src/app/habits/components/edit-habit-dialog/edit-habit-dialog.component';

@Component({
  selector: 'app-habits-sidebar',
  templateUrl: './habits-sidebar.component.html',
  styleUrls: ['./habits-sidebar.component.scss'],
})
export class HabitsSidebarComponent implements OnInit {
  habits$ = this.store.pipe(select(selectHabits));
  constructor(
    private readonly store: Store<AppState>,
    private addHabitDialog: MatDialog,
    private editHabitDialog: MatDialog
  ) {}

  ngOnInit(): void {}

  public openAddHabitDialog() {
    this.addHabitDialog.open(AddHabitDialogComponent, {
      panelClass: 'kairos-edit-task-dialog',
    });
  }

  public openEditHabitDialog(habit: HabitDto) {
    this.editHabitDialog.open(EditHabitDialogComponent, {
      panelClass: 'kairos-edit-task-dialog',
      data: habit,
    });
  }
}
