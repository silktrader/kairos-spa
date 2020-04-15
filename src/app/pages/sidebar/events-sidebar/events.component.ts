import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  selectAddEvents,
  selectRemoveEvents,
  selectEditEvents,
  selectHabitEvents,
} from 'src/app/store/schedule.selectors';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { deleteTask, updateTask } from 'src/app/store/schedule.actions';
import { AppState } from 'src/app/store/app-state';
import { AppEvent } from 'src/app/store/task-event.interface';
import { TaskDto } from 'src/app/models/dtos/task.dto';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  visibleEvents$ = new BehaviorSubject<EventsView>('added');

  additions$ = this.store.pipe(select(selectAddEvents));
  deletions$ = this.store.pipe(select(selectRemoveEvents));
  edits$ = this.store.pipe(select(selectEditEvents));
  habits$ = this.store.pipe(select(selectHabitEvents));

  referenceNow: Date;

  eventsSwitcher = new FormControl('added');

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.eventsSwitcher.valueChanges.subscribe((value) => {
      // update the reference date without needing to create one new instance for each event
      this.referenceNow = new Date();
      this.visibleEvents$.next(value);
    });
  }

  timeAgo(taskEvent: AppEvent): string {
    return formatDistanceToNow(taskEvent.timestamp);
  }

  delete(id: number): void {
    this.store.dispatch(deleteTask({ deletedTaskId: id }));
  }

  restoreEdit(currentDto: TaskDto, restoredDto: TaskDto): void {
    this.store.dispatch(
      updateTask({ originalTask: currentDto, updatedTask: restoredDto })
    );
  }
}

export type EventsView = 'added' | 'removed' | 'edited' | 'habits';
