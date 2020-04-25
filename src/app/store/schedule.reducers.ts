import { createReducer, on } from '@ngrx/store';
import * as ScheduleActions from './schedule.actions';
import { ScheduleState, SidebarSection } from './app-state';

import { setVisiblePeriod } from './schedule.actions';

export const initialState: ScheduleState = {
  visiblePeriod: undefined,
  sidebar: { opened: false, section: SidebarSection.Events },
  notifiedEventsIds: new Set(),
};

export const scheduleReducer = createReducer(
  initialState,

  on(setVisiblePeriod, (schedule, { startDate, endDate }) => {
    return {
      ...schedule,
      visiblePeriod: { startDate, endDate },
    };
  }),

  on(ScheduleActions.readTaskEvent, (schedule, { id: id }) => {
    const notifiedEventsIds = new Set([id]); // a string is considered an array of characters
    for (const eventId of schedule.notifiedEventsIds) {
      notifiedEventsIds.add(eventId);
    }
    return {
      ...schedule,
      notifiedEventsIds,
    };
  }),

  /* User Interface Controls */

  on(ScheduleActions.toggleSidebar, (state, { opened, section }) => {
    return { ...state, sidebar: { opened, section } };
  })
);
