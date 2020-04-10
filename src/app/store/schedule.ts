import { Task } from '../models/task';
import { TaskEvent } from './task-event.interface';
import { HabitDto } from '../models/dtos/habit-dto';

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  readonly habits: ReadonlyArray<HabitDto>;
  readonly loadingTasks: boolean;
  readonly updatingTasks: ReadonlyArray<number>;
  readonly taskEvents: ReadonlyArray<TaskEvent>;
}
