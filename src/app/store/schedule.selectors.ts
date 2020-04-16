import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Task } from '../models/task';
import { isSameDay } from 'date-fns';
import { ScheduleState } from './app-state';
import { EventOperation } from './task-event-operation.enum';
import {
  AddTaskEvent,
  DeleteTaskEvent,
  EditTaskEvent,
  AddHabitEvent,
  DeleteHabitEvent,
  EditHabitEvent,
} from './task-event.interface';

export const selectFeature = createFeatureSelector<
  { schedule: ScheduleState },
  ScheduleState
>('schedule');

export const selectLoading = createSelector(
  selectFeature,
  (state: ScheduleState) => state.loadingTasks
);

export const selectSidebar = createSelector(
  selectFeature,
  (state: ScheduleState) => state.sidebar
);

// Events selectors

export const selectEvents = createSelector(
  selectFeature,
  (state: ScheduleState) => state.events
);

export const selectAddEvents = createSelector(
  selectEvents,
  (events: ReadonlyArray<AddTaskEvent>) =>
    events.filter((event) => event.operation === EventOperation.AddedTask)
);

export const selectRemoveEvents = createSelector(
  selectEvents,
  (events: ReadonlyArray<DeleteTaskEvent>) =>
    events.filter((event) => event.operation === EventOperation.DeletedTask)
);

export const selectEditEvents = createSelector(
  selectEvents,
  (events: ReadonlyArray<EditTaskEvent>) =>
    events.filter((event) => event.operation === EventOperation.EditedTask)
);

export const selectTaskEvents = createSelector(
  selectEvents,
  (events: ReadonlyArray<AddTaskEvent | EditTaskEvent | DeleteTaskEvent>) =>
    events.filter(
      (event) =>
        event.operation === EventOperation.AddedTask ||
        event.operation === EventOperation.EditedTask ||
        event.operation === EventOperation.DeletedTask
    )
);

export const selectHabitEvents = createSelector(
  selectEvents,
  (events: ReadonlyArray<AddHabitEvent | EditHabitEvent | DeleteHabitEvent>) =>
    events.filter(
      (event) =>
        event.operation === EventOperation.EditedHabit ||
        event.operation === EventOperation.AddedHabit ||
        event.operation === EventOperation.DeletedHabit
    )
);

// Tasks selectors

export const selectAllTasks = createSelector(
  selectFeature,
  (state: ScheduleState) => state.tasks
);

export const selectTasksByDay = createSelector(
  selectAllTasks,
  (tasks: ReadonlyArray<Task>, props: { date: Date }) =>
    sortTasks(tasks.filter((task) => isSameDay(task.date, props.date)))
);

// tk look into simplifying this
export const sortTasks = (tasks: ReadonlyArray<Task>) => {
  if (tasks.length === 0) {
    return [];
  }

  let initialTask: Task | undefined;
  const mappedPreviousIds = new Map<number, Task>();

  for (const task of tasks) {
    // detect the initial task, whick lacks a reference to a previous one, IDs are never falsy
    if (!task.previousId) {
      if (initialTask) {
        console.error(
          'Two or more tasks are lacking references to previous tasks'
        ); // tk
        return tasks;
      }
      initialTask = task;
    } else {
      // map tasks so to get them by ID quickly
      mappedPreviousIds.set(task.previousId, task);
    }
  }

  if (!initialTask) {
    console.error('Could not find an initial task');
    return tasks;
  }

  const sortedTasks: Array<Task> = [initialTask];

  while (sortedTasks.length < tasks.length) {
    const orderedTask = mappedPreviousIds.get(
      sortedTasks[sortedTasks.length - 1].id
    );
    if (!orderedTask) {
      console.error(
        `Could not reconstruct tasks positions: ${JSON.stringify(tasks)}`
      );
      return tasks;
    }
    sortedTasks.push(orderedTask);
  }

  return sortedTasks;
};

export const selectTaskById = createSelector(
  selectAllTasks,
  (tasks: ReadonlyArray<Task>, props: { id: number }) =>
    tasks.find((task) => task.id === props.id)
);

export const selectTaskEditingId = createSelector(
  selectFeature,
  (state: ScheduleState) => state.editingTaskId
);

/* Habits Selectors */

export const selectHabits = createSelector(
  selectFeature,
  (state: ScheduleState) => state.habits
);

export const selectHabitsEntries = createSelector(
  selectFeature,
  (state: ScheduleState, props: { date: Date }) =>
    state.habitsEntries.filter((habitEntry) =>
      isSameDay(habitEntry.date, props.date)
    )
);
