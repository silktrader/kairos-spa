import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { selectNotifiableEvent } from '../store/schedule.selectors';
import { readTaskEvent } from '../store/schedule.actions';
import { Router } from '@angular/router';
import { AppState } from '../store/app-state';
import { EventOperation } from '../store/event-operation.enum';
import { MatDialog } from '@angular/material/dialog';
import { GeneralErrorDialogComponent } from '../core/components/general-error-dialog/general-error-dialog.component';
import { TasksOrderErrorDialogComponent } from '../tasks/components/tasks-order-error-dialog/tasks-order-error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // less than ideal flag to avoid processing new task events while one is being read
  private readingEvent = false;

  constructor(
    private readonly store: Store<AppState>,
    private snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly matDialog: MatDialog
  ) {
    this.store.pipe(select(selectNotifiableEvent)).subscribe((event) => {
      // ignore new events until the one being read is dismissed
      // the dismissal triggers a new value for the observable
      if (this.readingEvent || !event) return;

      // fetch the first event not yet shown and display it
      // const unread = events.find((event) => !event.read);
      this.readingEvent = true;
      const snackBarRef = this.snackBar.open(
        `${this.actionName(event.operation)} ${event.title}`,
        'View',
        {
          duration: 2000,
        }
      );

      snackBarRef.afterDismissed().subscribe(() => {
        this.readingEvent = false;
        // will trigger again the parent subscription
        this.store.dispatch(readTaskEvent({ id: event.id }));
      });

      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['events']);
      });
    });
  }

  private actionName(taskEventOperation: EventOperation) {
    switch (taskEventOperation) {
      case EventOperation.AddedTask:
      case EventOperation.AddedHabit:
        return 'Added';
      case EventOperation.EditedTask:
      case EventOperation.EditedHabit:
        return 'Edited';
      case EventOperation.DeletedTask:
      case EventOperation.DeletedHabit:
        return 'Removed';
      default:
        return 'Updated';
    }
  }

  warnError(error: Error): void {
    this.matDialog.open(GeneralErrorDialogComponent, {
      data: error,
      panelClass: 'kairos-dialog',
    });
  }

  warnTasksOrderError(date: string): void {
    this.matDialog.open(TasksOrderErrorDialogComponent, {
      data: date,
      panelClass: 'kairos-dialog',
    });
  }
}
