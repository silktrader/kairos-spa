import { createAction, props } from '@ngrx/store';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';
import { HabitDto } from '../models/dtos/habit.dto';
import { SidebarSection } from './app-state';
import { HabitEntryDto } from '../models/dtos/habit-entry.dto';

/* Tasks */

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

export const readTaskEvent = createAction(
  '[SCHEDULE] Read Task Event',
  props<{ id: string }>()
);

/* Habits */

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

export const getHabitsEntries = createAction(
  'Get Habits Entries',
  props<{ startDate: Date; endDate: Date }>()
);

export const getHabitsEntriesSuccess = createAction(
  'Get Habits Entries Success',
  props<{ habitsEntries: ReadonlyArray<HabitEntryDto> }>()
);

export const addHabitEntry = createAction(
  'Add Habit Entry',
  props<{ habitEntry: Omit<HabitEntryDto, 'id'> }>()
);

export const addHabitEntrySuccess = createAction(
  'Add Habit Entry Success',
  props<{ habitEntry: HabitEntryDto }>()
);

export const deleteHabitEntry = createAction(
  'Delete Habit Entry',
  props<{ habitEntry: HabitEntryDto }>()
);

export const deleteHabitEntrySuccess = createAction(
         'Delete Habit Entry Success',
         props<{ habitEntry: HabitEntryDto }>()
       );

/* Interface Controls */

export const toggleSidebar = createAction(
  'Toggle Sidebar',
  props<{ opened: boolean; section?: SidebarSection }>()
);
