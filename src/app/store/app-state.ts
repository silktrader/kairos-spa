export interface AppState {
  schedule: ScheduleState;
}

export interface ScheduleState {
  readonly visibleDates: ReadonlyArray<string>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
  readonly notifiedEventsIds: ReadonlySet<string>; // could be a set but new instances
}

export enum SidebarSection {
  Unscheduled,
  Events,
  Habits,
  Tags,
}
