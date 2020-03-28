import { Task } from './task';

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingTasks: boolean;
  readonly updatingTasks: ReadonlyArray<number>;
}
