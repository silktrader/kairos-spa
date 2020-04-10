import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddHabitDialogComponent } from '../add-habit-dialog/add-habit-dialog.component';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from 'src/app/store/schedule';
import { selectHabits } from 'src/app/store/schedule.selectors';
import { getHabits } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-habits-sidebar',
  templateUrl: './habits-sidebar.component.html',
  styleUrls: ['./habits-sidebar.component.scss'],
})
export class HabitsSidebarComponent implements OnInit {
  habits$ = this.store.pipe(select(selectHabits));
  constructor(
    private readonly store: Store<ScheduleState>,
    private addHabitDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(getHabits());
  }

  public openAddHabitDialog() {
    this.addHabitDialog.open(AddHabitDialogComponent, {
      panelClass: 'kairos-edit-task-dialog',
    });
  }
}
