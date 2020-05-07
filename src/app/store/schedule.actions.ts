import { createAction, props } from '@ngrx/store';
import { SidebarSection } from './app-state';
import { AppEvent } from './app-event.state';

export const setVisibleDates = createAction(
  '[SCHEDULE] Set Visible Dates',
  props<{ dates: ReadonlyArray<string> }>()
);

export const readTaskEvent = createAction(
  '[SCHEDULE] Read Task Event',
  props<{ id: string }>()
);

/* Interface Controls */

export const toggleSidebar = createAction(
  'Toggle Sidebar',
  props<{ opened: boolean; section?: SidebarSection }>()
);

/* Events */

export const addEvent = createAction('Add Event', props<{ event: AppEvent }>());

export const showUnhandledError = createAction(
  'Add Error',
  props<{ error: Error }>()
);
