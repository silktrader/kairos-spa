import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';

export const addTask = createAction('Add Task', props<{ task: Task }>());
export const setTasks = createAction(
  'Set Tasks',
  props<{ tasks: ReadonlyArray<Task> }>()
);
export const deleteTask = createAction('Delete Task', props<{ task: Task }>());
export const completeTask = createAction('Complete Task');
