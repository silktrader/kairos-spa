import { createSelector } from '@ngrx/store';
import { Task } from '../models/task';
import { isSameDay } from 'date-fns';
import { ScheduleState } from '../models/schedule';

export const selectFeature = (state: any) => state.schedule;

export const selectLoading = createSelector(
  selectFeature,
  (state: ScheduleState) => state.loadingTasks
);

export const selectEvents = createSelector(
  selectFeature,
  (state: ScheduleState) => state.taskEvents
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

export const selectTaskUpdating = createSelector(
  selectFeature,
  (state: ScheduleState, props: { id: number }) =>
    state.updatingTasks.find((id) => id === props.id)
);
