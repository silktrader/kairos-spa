import { createSelector, createFeatureSelector } from '@ngrx/store';
import { Task } from '../models/task';
import { isSameDay } from 'date-fns';
import { ScheduleState } from './app-state';
import { EventOperation } from './event-operation.enum';
import {
  AddTaskEvent,
  DeleteTaskEvent,
  EditTaskEvent,
} from './app-event.interface';
import { selectHabitsEvents } from '../habits/state/habits.selectors';

export const selectFeature = createFeatureSelector<
  { schedule: ScheduleState },
  ScheduleState
>('schedule');

export const selectLoadingState = createSelector(
  selectFeature,
  (state: ScheduleState) => state.loadingState
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

export const selectNotifiableEvent = createSelector(
  selectEvents,
  selectHabitsEvents,
  (appEvents, habitEvents) => {
    // fetch the first items in both collections; order of insertion matches the timestamps order
    const notifiableEvents = [];
    for (const appEvent of appEvents) {
      if (!appEvent.read) {
        notifiableEvents.push(appEvent);
        break;
      }
    }
    for (const habitEvent of habitEvents) {
      if (!habitEvent.read) {
        notifiableEvents.push(habitEvent);
        break;
      }
    }

    // need to sort according to timestamp
    return (
      notifiableEvents.sort((a, b) => b.timestamp - a.timestamp)[0] ?? null
    );
  }
);

// Tasks selectors

export const selectVisiblePeriod = createSelector(
  selectFeature,
  (state: ScheduleState) => state.visiblePeriod
);

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
