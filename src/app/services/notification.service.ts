import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { selectEvents } from '../store/schedule.selectors';
import { readTaskEvent } from '../store/schedule.actions';
import { Router } from '@angular/router';
import { ScheduleState } from '../store/schedule';
import { TaskEventOperation } from '../store/task-event-operation.enum';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // less than ideal flag to avoid processing new task events while one is being read
  private readingEvent = false;

  constructor(
    private readonly store: Store<ScheduleState>,
    private snackBar: MatSnackBar,
    private readonly router: Router
  ) {
    this.store.pipe(select(selectEvents)).subscribe((events) => {
      // ignore new events until the one being read is dismissed
      // the dismissal triggers a new value for the observable
      if (this.readingEvent) return;

      // fetch the first event not yet shown and display it
      const unread = events.find((event) => !event.read);
      if (unread) {
        this.readingEvent = true;
        const snackBarRef = this.snackBar.open(
          `${this.actionName(unread.operation)} ${unread.taskDto.title}`,
          'View',
          {
            duration: 2000,
          }
        );

        snackBarRef.afterDismissed().subscribe(() => {
          this.readingEvent = false;
          // will trigger again the parent subscription
          this.store.dispatch(readTaskEvent({ id: unread.id }));
        });

        snackBarRef.onAction().subscribe(() => {
          this.router.navigate(['events']);
        });
      }
    });
  }

  private actionName(taskEventOperation: TaskEventOperation) {
    switch (taskEventOperation) {
      case TaskEventOperation.Add:
        return 'Added';
      case TaskEventOperation.Edit:
        return 'Updated';
      default:
        return 'Removed';
    }
  }

  alert(message: string) {
    this.snackBar.open(message);
  }
}
