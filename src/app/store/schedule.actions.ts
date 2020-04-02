import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';

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

export const addTask = createAction(
  '[SCHEDULE] Add Task',
  props<{ task: Omit<TaskDto, 'id'> }>()
);

export const addTaskSuccess = createAction(
  '[SCHEDULE] Add Task Success',
  props<{ task: Task }>()
);

export const updateTask = createAction(
  '[SCHEDULE] Update Task',
  props<{ task: Task }>()
);

export const updateTaskSuccess = createAction(
  '[SCHEDULE] Update Task Success',
  props<{ task: Task }>()
);

export const updateTasks = createAction(
  '[SCHEDULE] Update Tasks',
  props<{ tasksDtos: ReadonlyArray<TaskDto> }>()
);

export const updateTasksSuccess = createAction(
  '[SCHEDULE] Update Tasks Success',
  props<{ tasks: ReadonlyArray<Task> }>()
);

export const deleteTask = createAction(
  '[SCHEDULE] Delete Task',
  props<{ deletedTaskId: number }>()
);

export const deleteTaskSuccess = createAction(
  '[SCHEDULE] Delete Task Success',
  props<{ deletedTaskId: number; affectedTask: Task | null }>()
);

export const completeTask = createAction('Complete Task');

export const repositionTasks = createAction(
  'Reposition Tasks',
  props<{ tasks: ReadonlyArray<Task> }>()
);
