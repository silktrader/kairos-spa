import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from 'src/app/models/schedule';
import {
  selectAdditionEvents,
  selectDeletionEvents,
} from 'src/app/store/schedule.selectors';
import { BehaviorSubject } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  visibleEvents$ = new BehaviorSubject<EventsView>('additions');

  additions$ = this.store.pipe(select(selectAdditionEvents));
  deletions$ = this.store.pipe(select(selectDeletionEvents));

  eventsSwitcher = new FormControl('additions');

  constructor(private readonly store: Store<ScheduleState>) {}

  ngOnInit(): void {
    this.eventsSwitcher.valueChanges.subscribe((value) =>
      this.visibleEvents$.next(value)
    );
  }
}

export type EventsView = 'additions' | 'deletions' | 'updates';
