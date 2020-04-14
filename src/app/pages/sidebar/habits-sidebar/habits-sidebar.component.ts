import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddHabitDialogComponent } from '../../add-habit-dialog/add-habit-dialog.component';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { selectHabits } from 'src/app/store/schedule.selectors';
import { EditHabitDialogComponent } from 'src/app/dialogs/edit-habit-dialog/edit-habit-dialog.component';
import { HabitDto } from 'src/app/models/dtos/habit.dto';

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
