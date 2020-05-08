import { TasksState } from './tasks.state';
import { createReducer, on } from '@ngrx/store';
import * as TasksActions from './tasks.actions';
import {
  AddTaskEvent,
  EditTaskEvent,
  DeleteTaskEvent,
  GenericTaskEvent,
} from 'src/app/store/app-event.state';
import { TaskDto } from '../models/task.dto';

export const initialState: TasksState = {
  tasks: [],
  editingTaskId: undefined,
  loadingDates: [],
  errorDates: [],
  events: [],
  tags: [],
  timers: [],
};

export const filteredTasks = (
  tasks: ReadonlyArray<TaskDto>,
  ...removedTasksIds: Array<number>
): Array<TaskDto> => {
  const removedIds = new Set<number>(removedTasksIds);

  const finalTasks: Array<TaskDto> = [];

  for (const task of tasks) {
    if (removedIds.has(task.id)) {
      continue;
    }
    finalTasks.push(task);
  }

  return finalTasks;
};

export const tasksReducer = createReducer(
  initialState,

  on(TasksActions.addSuccess, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: [...schedule.tasks, task],
      events: [...schedule.events, new AddTaskEvent(task)],
    };
  }),

  on(TasksActions.edit, (schedule, { originalTask, updatedTask }) => {
    return {
      ...schedule,
      editingTaskId: originalTask.id,
    };
  }),

  on(TasksActions.editSuccess, (schedule, { originalTask, updatedTask }) => {
    return {
      ...schedule,
      tasks: [...filteredTasks(schedule.tasks, updatedTask.id), updatedTask],
      editingTaskId: undefined,
      events: [
        ...schedule.events,
        new EditTaskEvent(updatedTask, originalTask),
      ],
    };
  }),

  on(TasksActions.updateTasks, (schedule, { tasksDtos }) => {
    return {
      ...schedule,
      updatingTasks: [...tasksDtos.map((task) => task.id)],
    };
  }),

  on(TasksActions.updateTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks: [
        ...filteredTasks(schedule.tasks, ...tasks.map((task) => task.id)),
        ...tasks,
      ],
      // provide a generic notification, absent from the log but picked up by the snackbar
      events: [...schedule.events, new GenericTaskEvent()],
    };
  }),

  on(TasksActions.get, (state, props) => ({
    ...state,
    loadingDates: [...props.dates],
  })),

  on(TasksActions.getSuccess, (state, { tasks }) => {
    return {
      ...state,
      tasks,
      loadingDates: [],
      errorDates: [],
    };
  }),

  on(TasksActions.getFailed, (schedule, { dates }) => {
    return {
      ...schedule,
      loadingDates: [],
      errorDates: [...dates],
    };
  }),

  on(
    TasksActions.removeSuccess,
    (state, { removedTaskId: deletedTaskId, affectedTask }) => {
      const newTasks: Array<TaskDto> = [];

      let deletedTask;
      for (const task of state.tasks) {
        // cache the deleted task dto to allow for it to be restored later
        if (task.id === deletedTaskId) {
          deletedTask = task;
          continue;
        }

        // skip the affected task which needs to be updated
        if (task.id === affectedTask?.id) continue;

        newTasks.push(task);
      }

      // the affected task will be null when the first element is deleted
      if (affectedTask) newTasks.push(affectedTask);

      return {
        ...state,
        tasks: newTasks,
        events: [
          ...state.events,
          // purposedly not signaling the affected task's move
          new DeleteTaskEvent(deletedTask as TaskDto),
        ],
      };
    }
  ),

  /* Tags */

  on(TasksActions.getTagsSuccess, (state, { tags }) => {
    return {
      ...state,
      tags,
    };
  }),

  on(TasksActions.addTagSuccess, (state, { tagDto }) => ({
    ...state,
    tags: [...state.tags, tagDto],
  })),

  on(TasksActions.editTagSuccess, (state, { tagDto }) => ({
    ...state,
    tags: [...state.tags.filter((tag) => tag.id !== tagDto.id), tagDto],
  })),

  on(TasksActions.deleteTagSuccess, (state, { tagDto }) => {
    return {
      ...state,
      tasks: state.tasks.map((task) => ({
        ...task,
        tags: task.tags.filter((tag) => tag !== tagDto.name),
      })),
      tags: state.tags.filter((tag) => tag.id !== tagDto.id),
    };
  }),

  /* Timers */
  on(TasksActions.getTimersSuccess, (state, { timers }) => ({
    ...state,
    timers,
  })),

  on(TasksActions.addTimerSuccess, (state, { taskTimer }) => ({
    ...state,
    timers: [...state.timers, taskTimer],
  })),

  on(TasksActions.stopTimerSuccess, (state, { taskId }) => ({
    ...state,
    timers: state.timers.filter((timer) => timer.taskId !== taskId),
  }))
);
