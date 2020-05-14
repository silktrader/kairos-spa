import { createReducer, on, ActionReducer } from '@ngrx/store';
import * as ScheduleActions from './schedule.actions';
import { ScheduleState, SidebarSection, AppState } from './app-state';

export const initialState: ScheduleState = {
  visibleDates: [],
  sidebar: { opened: false, section: SidebarSection.Events },
  notifiedEventsIds: new Set(), // tk use serialisable array?
};

export function resetReducer(
  reducer: ActionReducer<AppState>
): ActionReducer<AppState> {
  return (state, action) => {
    if (action.type === '[SCHEDULE] Reset') {
      return reducer(undefined, action);
    }
    // parts of the state can be maintained like so:
    // return reducer({schedule: state.schedule}, action)
    return reducer(state, action);
  };
}

export const scheduleReducer = createReducer(
  initialState,

  on(ScheduleActions.setVisibleDates, (state, { dates }) => {
    return {
      ...state,
      visibleDates: dates,
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
    // keep the focused section when simple `open` or `close` actions are dispatched
    section = section ?? state.sidebar.section;
    return { ...state, sidebar: { opened, section } };
  })
);
