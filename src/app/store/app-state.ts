import { Task } from '../models/task';
import { AppEvent } from './app-event.interface';
import { HabitDto } from '../habits/models/habit.dto';
import { HabitEntryDto } from '../habits/models/habit-entry.dto';

export interface AppState {
  schedule: ScheduleState;
}

export interface ScheduleState {
  readonly visiblePeriod: Readonly<
    { startDate: Date; endDate: Date } | undefined
  >;
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingState: TasksLoadingState;
  readonly editingTaskId: number | undefined;
  readonly events: ReadonlyArray<AppEvent>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
}

export enum TasksLoadingState {
  Loading,
  Loaded,
  Error,
}

export enum SidebarSection {
  Events = 'events',
  Habits = 'habits',
}
