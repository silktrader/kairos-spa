import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/store/app-state';
import { Store, select } from '@ngrx/store';
import { selectVisiblePeriod } from 'src/app/store/schedule.selectors';
import { first } from 'rxjs/operators';
import { selectLoadingState } from 'src/app/tasks/state/tasks.selectors';
import { TasksLoadingState } from 'src/app/tasks/state/tasks.state';
import { get } from 'src/app/tasks/state/tasks.actions';

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
        if (dateRange) this.store.dispatch(get(dateRange));
        // the dialog's closed by a successful loading of tasks
      });
  }
}
