import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ScheduleState } from './app-state';
import { selectHabitsEvents } from '../habits/state/habits.selectors';
import { selectTaskEvents } from '../tasks/state/tasks.selectors';
import { isSameDay, addDays } from 'date-fns';

export const selectFeature = createFeatureSelector<
  { schedule: ScheduleState },
  ScheduleState
>('schedule');

export const selectVisiblePeriod = createSelector(
  selectFeature,
  (state: ScheduleState) => state.visiblePeriod
);

export const selectVisibleDates = createSelector(
  selectVisiblePeriod,
  (period) => {
    const dates = [period.startDate];
    let focusedDate = period.startDate;
    while (!isSameDay(focusedDate, period.endDate)) {
      focusedDate = addDays(focusedDate, 1);
      dates.push(focusedDate);
    }
    return dates;
  }
);

export const selectSidebar = createSelector(
  selectFeature,
  (state: ScheduleState) => state.sidebar
);

// Events selectors

export const selectNotifiedEventsIds = createSelector(
  selectFeature,
  (state) => state.notifiedEventsIds
);

export const selectNotifiableEvent = createSelector(
  selectTaskEvents,
  selectHabitsEvents,
  selectNotifiedEventsIds,
  (taskEvents, habitsEvents, notifiedEventsIds) => {
    // fetch the first items in both collections; order of insertion matches the timestamps order
    const notifiableEvents = [];
    for (const taskEvent of taskEvents) {
      if (!notifiedEventsIds.has(taskEvent.id)) {
        notifiableEvents.push(taskEvent);
        break;
      }
    }
    for (const habitEvent of habitsEvents) {
      if (!notifiedEventsIds.has(habitEvent.id)) {
        notifiableEvents.push(habitEvent);
        break;
      }
    }

    // need to sort according to timestamp
    return (
      notifiableEvents.sort((a, b) => b.timestamp - a.timestamp)[0] ?? null
    );
  }
);
