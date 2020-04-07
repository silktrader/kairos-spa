import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ScheduleState, TaskEvent } from 'src/app/models/schedule';
import {
  selectAdditionEvents,
  selectDeletionEvents,
} from 'src/app/store/schedule.selectors';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';
import { formatDistanceToNow } from 'date-fns';
import { DayService } from 'src/app/services/day.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  visibleEvents$ = new BehaviorSubject<EventsView>('additions');

  additions$ = this.store.pipe(select(selectAdditionEvents));
  deletions$ = this.store.pipe(select(selectDeletionEvents));

  referenceNow: Date;

  eventsSwitcher = new FormControl('additions');

  constructor(
    private readonly store: Store<ScheduleState>,
    private readonly ds: DayService
  ) {}

  ngOnInit(): void {
    this.eventsSwitcher.valueChanges.subscribe((value) => {
      // update the reference date without needing to create one new instance for each event
      this.referenceNow = new Date();
      this.visibleEvents$.next(value);
    });
  }

  timeAgo(taskEvent: TaskEvent): string {
    return formatDistanceToNow(taskEvent.timestamp);
  }
}

export type EventsView = 'additions' | 'deletions';
