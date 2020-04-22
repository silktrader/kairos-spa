import { createAction, props } from '@ngrx/store';
import { Task } from 'src/app/tasks/models/task';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { TagDto } from '../models/tag.dto';

export const get = createAction(
  '[TASKS] Get',
  props<{ startDate: Date; endDate: Date }>()
);

export const getSuccess = createAction(
  '[TASKS] Get Success',
  props<{ tasks: ReadonlyArray<Task> }>()
);

export const getFailed = createAction(
  '[TASKS] Get Failed',
  props<{ error: string }>()
);

export const add = createAction(
  '[TASKS] Add',
  props<{ task: Omit<TaskDto, 'id'> }>()
);

export const addSuccess = createAction(
  '[TASKS] Add Success',
  props<{ task: Task }>()
);

export const edit = createAction(
  '[TASKS] Edit',
  props<{ originalTask: TaskDto; updatedTask: TaskDto }>()
);

export const editSuccess = createAction(
  '[TASKS] Edit Success',
  props<{ originalTask: TaskDto; updatedTask: Task }>()
);

export const updateTasks = createAction(
  '[TASKS] Update Tasks',
  props<{ tasksDtos: ReadonlyArray<TaskDto> }>()
);

export const updateTasksSuccess = createAction(
  '[TASKS] Update Tasks Success',
  props<{ tasks: ReadonlyArray<Task> }>()
);

export const remove = createAction(
  '[TASKS] Remove',
  props<{ removedTaskId: number }>()
);

export const removeSuccess = createAction(
  '[TASKS] Remove Success',
  props<{ removedTaskId: number; affectedTask: Task | null }>()
);

/* Tags */

export const getTags = createAction('[TASKS] Get Tags');

export const getTagsSuccess = createAction(
  '[TASKS] Get Tags Success',
  props<{ tags: ReadonlyArray<TagDto> }>()
);

export const getTagsFailure = createAction('[TASKS] Get Tags Failure');
