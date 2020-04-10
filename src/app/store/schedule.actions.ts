import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';
import { HabitDto } from '../models/dtos/habit-dto';

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
  '[SCHEDULE] Edit Task',
  props<{ originalTask: TaskDto; updatedTask: TaskDto }>()
);

export const updateTaskSuccess = createAction(
  '[SCHEDULE] Edit Task Success',
  props<{ originalTask: TaskDto; updatedTask: Task }>()
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

export const readTaskEvent = createAction(
  '[SCHEDULE] Read Task Event',
  props<{ id: string }>()
);

export const addHabit = createAction(
  'Add Habbit',
  props<{ habit: HabitDto }>()
);

export const addHabitSuccess = createAction(
  'Add Habit Success',
  props<{ habit: HabitDto }>()
);

export const getHabits = createAction('Get Habits');

export const getHabitsSuccess = createAction(
  'Get Habits Success',
  props<{ habits: ReadonlyArray<HabitDto> }>()
);
