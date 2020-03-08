import { createAction, props } from '@ngrx/store';
import { Day } from '../models/day';
import { Task } from '../models/task';

export const addTask = createAction(
  'Add Task',
  props<{ day: Day; task: Task }>()
);

export const deleteTask = createAction(
  'Delete Task',
  props<{ day: Day; task: Task }>()
);

export const completeTask = createAction('Complete Task');
