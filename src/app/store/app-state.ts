import { Task } from '../models/task';
import { AppEvent } from './task-event.interface';
import { HabitDto } from '../habits/models/habit.dto';
import { HabitEntryDto } from '../habits/models/habit-entry.dto';

export interface AppState {
  schedule: ScheduleState;
}

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  // readonly habits: ReadonlyArray<HabitDto>;
  // readonly habitsEntries: ReadonlyArray<HabitEntryDto>;
  readonly loadingTasks: boolean;
  // readonly editingHabit: boolean;
  readonly editingTaskId: number | undefined;
  readonly events: ReadonlyArray<AppEvent>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
}

export enum SidebarSection {
  Events = 'events',
  Habits = 'habits',
}
