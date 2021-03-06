import { AppEvent } from 'src/app/store/app-event.state';
import { TagDto } from '../models/tag.dto';
import { TaskTimer } from '../models/task-timer.dto';
import { TaskDto } from '../models/task.dto';

export interface TasksState {
  readonly tasks: ReadonlyArray<TaskDto>;
  readonly loadingDates: ReadonlyArray<string>;
  readonly errorDates: ReadonlyArray<string>;
  readonly editingTaskId: number | undefined;
  readonly events: ReadonlyArray<AppEvent>;
  readonly tags: ReadonlyArray<TagDto>;
  readonly timers: ReadonlyArray<TaskTimer>;
}

// use strings to avoid falsy values
export enum TasksLoadingState {
  Loading = 'Loading',
  Loaded = 'Loaded',
  Error = 'Error',
}
