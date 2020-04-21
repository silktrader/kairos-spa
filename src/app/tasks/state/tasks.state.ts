import { Task } from 'src/app/models/task';
import { AppEvent } from 'src/app/store/app-event.state';

export interface TasksState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingState: TasksLoadingState;
  readonly editingTaskId: number | undefined;
  readonly events: ReadonlyArray<AppEvent>;
}

export enum TasksLoadingState {
  Loading,
  Loaded,
  Error,
}
