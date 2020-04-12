import { Task } from '../models/task';
import { TaskEvent } from './task-event.interface';
import { HabitDto } from '../models/dtos/habit.dto';
import { HabitEntryDto } from '../models/dtos/habit-entry.dto';

export interface AppState {
  readonly tasks: ReadonlyArray<Task>;
  readonly habits: ReadonlyArray<HabitDto>;
  readonly habitsEntries: ReadonlyArray<HabitEntryDto>;
  readonly loadingTasks: boolean;
  readonly editingTaskId: number | undefined;
  readonly taskEvents: ReadonlyArray<TaskEvent>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
}

export enum SidebarSection {
  Events = 'events',
  Habits = 'habits',
}
