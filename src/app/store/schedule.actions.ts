import { createAction, props } from '@ngrx/store';
import { SidebarSection } from './app-state';
import { AppEvent } from './app-event.state';

export const setVisiblePeriod = createAction(
  '[SCHEDULE] Set Visible Period',
  props<{ startDate: Date; endDate: Date }>()
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
