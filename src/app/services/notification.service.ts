import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ScheduleState, TaskEventOperation } from '../models/schedule';
import { Store, select } from '@ngrx/store';
import { selectEvents } from '../store/schedule.selectors';
import { readTaskEvent } from '../store/schedule.actions';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // less than ideal flag to avoid processing new task events while one is being read
  private readingEvent = false;

  constructor(
    private readonly store: Store<ScheduleState>,
    private snackBar: MatSnackBar
  ) {
    this.store.pipe(select(selectEvents)).subscribe((events) => {
      // ignore new events until the one being read is dismissed
      // the dismissal triggers a new value for the observable
      if (this.readingEvent) return;

      // fetch the first event not yet shown and display it
      const unread = events.find((event) => !event.read);
      if (unread) {
        this.readingEvent = true;
        this.snackBar
          .open(
            `${this.actionName(unread.operation)} ${unread.taskDto.title}`,
            'View',
            {
              duration: 2000,
            }
          )
          .afterDismissed()
          .subscribe(() => {
            this.readingEvent = false;
            // will trigger again the parent subscription
            this.store.dispatch(readTaskEvent({ id: unread.id }));
          });
      }
    });
  }

  private actionName(taskEventOperation: TaskEventOperation) {
    switch (taskEventOperation) {
      case TaskEventOperation.Addition:
        return 'Added';
      case TaskEventOperation.Update:
        return 'Updated';
      default:
        return 'Removed';
    }
  }

  alert(message: string) {
    this.snackBar.open(message);
  }
}
