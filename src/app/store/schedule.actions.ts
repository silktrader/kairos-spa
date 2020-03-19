import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';

export const addTask = createAction('Add Task', props<{ task: Task }>());
export const setTasks = createAction(
  'Set Tasks',
  props<{ tasks: ReadonlyArray<Task> }>()
);
export const deleteTask = createAction(
  'Delete Task',
  props<{ deletedTaskId: number; affectedTask: Task | null }>()
);
export const completeTask = createAction('Complete Task');
