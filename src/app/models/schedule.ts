import { Task } from './task';

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loading: boolean;
}
