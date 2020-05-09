import { createAction, props } from '@ngrx/store';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { TagDto } from '../models/tag.dto';
import { TaskTimer } from '../models/task-timer.dto';

export const getTasks = createAction(
  '[TASKS] Set Tasks',
  props<{ dates: Array<string> }>()
);

export const getTasksSuccess = createAction(
  '[TASKS] Set Tasks Success',
  props<{ tasks: ReadonlyArray<TaskDto> }>()
);

export const getTasksFailed = createAction(
  '[TASKS] Set Tasks Failed',
  props<{ dates: ReadonlyArray<string> }>()
);

export const removeDatesTasks = createAction(
  '[TASKS] Remove Date Tasks',
  props<{ dates: ReadonlyArray<string> }>()
);

export const addTask = createAction(
  '[TASKS] Add Task',
  props<{ task: Omit<TaskDto, 'id'> }>()
);

export const addTaskSuccess = createAction(
  '[TASKS] Add Task Success',
  props<{ task: TaskDto }>()
);

export const edit = createAction(
  '[TASKS] Edit',
  props<{ originalTask: TaskDto; updatedTask: TaskDto }>()
);

export const editSuccess = createAction(
  '[TASKS] Edit Success',
  props<{ originalTask: TaskDto; updatedTask: TaskDto }>()
);

export const updateTasks = createAction(
  '[TASKS] Update Tasks',
  props<{ tasks: ReadonlyArray<TaskDto> }>()
);

export const updateTasksSuccess = createAction(
  '[TASKS] Update Tasks Success',
  props<{ tasks: ReadonlyArray<TaskDto> }>()
);

export const remove = createAction(
  '[TASKS] Remove',
  props<{ removedTaskId: number }>()
);

export const removeSuccess = createAction(
  '[TASKS] Remove Success',
  props<{ removedTaskId: number; affectedTask: TaskDto | null }>()
);

/* Tags */

export const getTags = createAction('[TASKS] Get Tags');

export const getTagsSuccess = createAction(
  '[TASKS] Get Tags Success',
  props<{ tags: ReadonlyArray<TagDto> }>()
);

export const getTagsFailure = createAction('[TASKS] Get Tags Failure');

export const addTag = createAction(
  '[TASKS] Add Tag',
  props<{ tagDto: Omit<TagDto, 'id'> }>()
);

export const addTagSuccess = createAction(
  '[TASKS] Add Tag Success',
  props<{ tagDto: TagDto }>()
);

export const editTag = createAction(
  '[TASKS] Edit Tag',
  props<{ tagDto: TagDto }>()
);

export const editTagSuccess = createAction(
  '[TASKS] Edit Tag Success',
  props<{ tagDto: TagDto }>()
);

export const deleteTag = createAction(
  '[TASKS] Delete Tag',
  props<{ tagDto: TagDto }>()
);

export const deleteTagSuccess = createAction(
  '[TASKS] Delete Tag Success',
  props<{ tagDto: TagDto }>()
);

/* Timers */

export const getTimers = createAction('[TASKS] Get Timers');

export const getTimersSuccess = createAction(
  '[TASKS] Get Timers Success',
  props<{ timers: ReadonlyArray<TaskTimer> }>()
);

export const addTimer = createAction(
  '[TASKS] Add Timer',
  props<{ taskTimer: TaskTimer }>()
);

export const addTimerSuccess = createAction(
  '[TASKS] Add Timer Success',
  props<{ taskTimer: TaskTimer }>()
);

export const stopTimer = createAction(
  '[TASKS] Stop Timer',
  props<{ taskId: number }>()
);

export const stopTimerSuccess = createAction(
  '[TASKS] Stop Timer Success',
  props<{ taskId: number }>()
);
