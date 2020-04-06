import { Task } from './task';
import { TaskDto } from './dtos/task.dto';

export interface ScheduleState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingTasks: boolean;
  readonly updatingTasks: ReadonlyArray<number>;
  readonly taskEvents: ReadonlyArray<TaskEvent>;
}

export interface TaskEvent {
  id: string;
  operation: TaskEventOperation;
  taskDto: TaskDto;
  read: boolean;
}

export enum TaskEventOperation {
  Addition = 'addition',
  Deletion = 'removal',
  Update = 'update',
}
