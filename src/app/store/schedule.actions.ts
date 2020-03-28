import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';

export const getDatesTasks = createAction(
  '[SCHEDULE] Get Dates Tasks',
  props<{ startDate: Date; endDate: Date }>()
);

export const getDatesTasksSuccess = createAction(
  '[SCHEDULE Get Dates Tasks Success',
  props<{ tasks: ReadonlyArray<Task> }>()
);

export const getDatesTasksFailed = createAction(
  '[SCHEDULE] Get Dates Tasks Failed'
);

export const addTask = createAction('Add Task', props<{ task: Task }>());

export const updateTask = createAction(
  '[SCHEDULE] Update Task',
  props<{ task: Task }>()
);

export const updateTaskSuccess = createAction(
  '[SCHEDULE] Update Task Success',
  props<{ task: Task }>()
);

export const deleteTask = createAction(
  'Delete Task',
  props<{ deletedTaskId: number; affectedTask: Task | null }>()
);
export const completeTask = createAction('Complete Task');

export const repositionTasks = createAction(
  'Reposition Tasks',
  props<{ tasks: ReadonlyArray<Task> }>()
);
