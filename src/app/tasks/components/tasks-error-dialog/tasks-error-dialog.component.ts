import { Component, OnInit } from '@angular/core';
import { AppState } from 'src/app/store/app-state';
import { Store, select } from '@ngrx/store';
import { first } from 'rxjs/operators';
import { selectLoadingState } from 'src/app/tasks/state/tasks.selectors';
import { TasksLoadingState } from 'src/app/tasks/state/tasks.state';
import { get } from 'src/app/tasks/state/tasks.actions';
import { selectVisibleDates } from 'src/app/store/schedule.selectors';

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
    this.store.pipe(select(selectVisibleDates), first()).subscribe((dates) => {
      if (dates) this.store.dispatch(get({ dates }));
      // the dialog's closed by a successful loading of tasks
    });
  }
}
