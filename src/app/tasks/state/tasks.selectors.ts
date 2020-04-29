import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Task } from 'src/app/tasks/models/task';
import { isSameDay } from 'date-fns';
import { TasksState } from './tasks.state';
import { TagDto } from '../models/tag.dto';

export const selectTasksFeature = createFeatureSelector<TasksState>('tasks');

export const selectTasks = createSelector(
  selectTasksFeature,
  (state) => state.tasks
);

export const selectTasksByDate = createSelector(
  selectTasks,
  (tasks: ReadonlyArray<Task>, props: { date: Date }) =>
    tasks.filter((task) => isSameDay(task.date, props.date))
);

export const selectTaskEditingId = createSelector(
  selectTasksFeature,
  (state) => state.editingTaskId
);

export const selectTaskEvents = createSelector(
  selectTasksFeature,
  (state) => state.events
);

export const selectLoadingState = createSelector(
  selectTasksFeature,
  (state) => state.loadingState
);

/* Tags */

export const selectTags = createSelector(
  selectTasksFeature,
  (state) => state.tags
);

export const selectAvailableTagColours = createSelector(
  selectTasksFeature,
  (state) => state.availableTagColours
);

export const selectTagColour = createSelector(
  selectTags,
  (tags: Array<TagDto>, props: { tagName: string }) =>
    tags.find((tag) => tag.name === props.tagName)?.colour
);
