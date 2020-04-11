import { Task } from '../models/task';
import { TaskEvent } from './task-event.interface';
import { HabitDto } from '../models/dtos/habit-dto';

export interface AppState {
  readonly tasks: ReadonlyArray<Task>;
  readonly habits: ReadonlyArray<HabitDto>;
  readonly loadingTasks: boolean;
  readonly updatingTasks: ReadonlyArray<number>;
  readonly taskEvents: ReadonlyArray<TaskEvent>;
  readonly sidebar: { opened: boolean; section: SidebarSection };
}

export enum SidebarSection {
  Events = 'events',
  Habits = 'habits',
}
