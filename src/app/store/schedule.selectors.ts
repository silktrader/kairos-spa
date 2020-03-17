import { createSelector } from '@ngrx/store';
import { Task } from '../models/task';
import { isSameDay } from 'date-fns';

export interface FeatureState {
  tasks: ReadonlyArray<Task>;
}

export const selectFeature = (state: any) => state.schedule;

export const selectAllTasks = createSelector(
  selectFeature,
  (state: FeatureState) => state.tasks
);

export const selectTasksByDay = createSelector(
  selectAllTasks,
  (tasks: ReadonlyArray<Task>, props: { date: Date }) =>
    tasks.filter(task => isSameDay(task.date, props.date))
);
