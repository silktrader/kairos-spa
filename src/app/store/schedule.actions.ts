import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';

export const addTask = createAction('Add Task', props<{ task: Task }>());
export const updateTask = createAction('Update Task', props<{ task: Task }>());
export const setTasks = createAction(
  'Set Tasks',
  props<{ tasks: ReadonlyArray<Task> }>()
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
