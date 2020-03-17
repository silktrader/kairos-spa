import { Task } from './task';

export interface Schedule {
  readonly tasks: ReadonlyArray<Task>;
}
