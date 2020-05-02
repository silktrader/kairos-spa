export interface AppState {
  schedule: ScheduleState;
}

export interface ScheduleState {
  readonly visiblePeriod: Readonly<{ startDate: Date; endDate: Date }>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
  readonly notifiedEventsIds: ReadonlySet<string>; // could be a set but new instances
}

export enum SidebarSection {
  Events,
  Habits,
  Tags,
}
