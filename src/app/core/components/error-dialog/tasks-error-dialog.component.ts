import { Component, OnInit } from '@angular/core';
import { AppState, TasksLoadingState } from 'src/app/store/app-state';
import { Store, select } from '@ngrx/store';
import { getDatesTasks } from 'src/app/store/schedule.actions';
import {
  selectVisiblePeriod,
  selectLoadingState,
} from 'src/app/store/schedule.selectors';
import { first, map } from 'rxjs/operators';

@Component({
  selector: 'app-tasks-error-dialog',
  templateUrl: './tasks-error-dialog.component.html',
  styleUrls: ['./tasks-error-dialog.component.scss'],
})
export class TasksErrorDialogComponent implements OnInit {
  loading$ = this.store.pipe(select(selectLoadingState));
  loadingState = TasksLoadingState;

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {}

  retry(): void {
    this.store
      .pipe(select(selectVisiblePeriod), first())
      .subscribe((dateRange) => {
        if (dateRange) this.store.dispatch(getDatesTasks(dateRange));
        // the dialog's closed by a successful loading of tasks
      });
  }
}
