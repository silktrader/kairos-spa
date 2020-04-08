import { Task } from '../models/task';
import { TaskEvent } from './task-event.interface';

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingTasks: boolean;
  readonly updatingTasks: ReadonlyArray<number>;
  readonly taskEvents: ReadonlyArray<TaskEvent>;
}
