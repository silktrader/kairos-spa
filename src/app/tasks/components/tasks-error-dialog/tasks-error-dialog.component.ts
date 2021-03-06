import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppState } from 'src/app/store/app-state';
import { Store, select } from '@ngrx/store';
import { first, takeUntil } from 'rxjs/operators';
import { selectLoadingTasks } from 'src/app/tasks/state/tasks.selectors';
import { getTasks, getTasksSuccess } from 'src/app/tasks/state/tasks.actions';
import { selectVisibleDates } from 'src/app/store/schedule.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tasks-error-dialog',
  templateUrl: './tasks-error-dialog.component.html',
  styleUrls: ['./tasks-error-dialog.component.scss'],
})
export class TasksErrorDialogComponent implements OnInit, OnDestroy {
  loading$ = this.store.select(selectLoadingTasks);

  readonly ngUnsubscribe$ = new Subject();

  constructor(
    private readonly store: Store<AppState>,
    private readonly actions$: Actions,
    public dialogRef: MatDialogRef<TasksErrorDialogComponent>
  ) {}

  ngOnInit(): void {
    this.actions$
      .pipe(ofType(getTasksSuccess), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.dialogRef.close();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  retry(): void {
    this.store
      .pipe(select(selectVisibleDates), first())
      .subscribe((dates: Array<string>) => {
        if (dates) this.store.dispatch(getTasks({ dates }));
        // the dialog's closed by a successful loading of tasks
      });
  }
}
