import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TasksState } from './tasks.state';
import { TagDto } from '../models/tag.dto';
import { baseTagColours } from './colours.state';
import { TaskTimer } from '../models/task-timer.dto';
import { TaskDto } from '../models/task.dto';

export const selectTasksFeature = createFeatureSelector<TasksState>('tasks');

export const selectTasks = createSelector(
  selectTasksFeature,
  (state) => state.tasks
);

export const selectTasksByDate = createSelector(
  selectTasks,
  (tasks: ReadonlyArray<TaskDto>, props: { date: string }) =>
    tasks.filter((task) => task.date === props.date)
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

export const selectTagColoursList = createSelector(selectTags, (tags) => {
  return baseTagColours.filter(
    (colour) => !tags.map((tag) => tag.colour).includes(colour)
  );
});

export const selectTagColour = createSelector(
  selectTags,
  (tags: Array<TagDto>, props: { tagName: string }) =>
    tags.find((tag) => tag.name === props.tagName)?.colour
);

/* Timers */

export const selectTimers = createSelector(
  selectTasksFeature,
  (state) => state.timers
);

export const selectTaskTimer = createSelector(
  selectTimers,
  (timers: Array<TaskTimer>, props: { taskId: number }) =>
    timers.find((timer) => timer.taskId === props.taskId)
);
