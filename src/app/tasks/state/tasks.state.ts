import { Task } from 'src/app/tasks/models/task';
import { AppEvent } from 'src/app/store/app-event.state';
import { TagDto } from '../models/tag.dto';

export interface TasksState {
  readonly tasks: ReadonlyArray<Task>;
  readonly loadingState: TasksLoadingState;
  readonly editingTaskId: number | undefined;
  readonly events: ReadonlyArray<AppEvent>;
  readonly tags: ReadonlyArray<TagDto>;
  readonly availableTagColours: ReadonlyArray<string>;
}

export enum TasksLoadingState {
  Loading,
  Loaded,
  Error,
}
