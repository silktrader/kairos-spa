import { TasksState, TasksLoadingState } from './tasks.state';
import { createReducer, on } from '@ngrx/store';
import * as TasksActions from './tasks.actions';
import {
  AddTaskEvent,
  EditTaskEvent,
  DeleteTaskEvent,
  GenericTaskEvent,
} from 'src/app/store/app-event.state';
import { Task } from 'src/app/tasks/models/task';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { baseTagColours } from './colours.state';

export const initialState: TasksState = {
  tasks: [],
  loadingState: TasksLoadingState.Loading,
  editingTaskId: undefined,
  events: [],
  tags: [],
  availableTagColours: [],
};

export const filteredTasks = (
  tasks: ReadonlyArray<Task>,
  ...removedTasksIds: Array<number>
): Array<Task> => {
  const removedIds = new Set<number>(removedTasksIds);

  const finalTasks: Array<Task> = [];

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
      events: [...schedule.events, new AddTaskEvent(task.toDto())],
    };
  }),

  on(TasksActions.edit, (schedule, { updatedTask: task }) => {
    return {
      ...schedule,
      editingTaskId: task.id,
    };
  }),

  on(TasksActions.editSuccess, (schedule, { originalTask, updatedTask }) => {
    return {
      ...schedule,
      tasks: [...filteredTasks(schedule.tasks, updatedTask.id), updatedTask],
      editingTaskId: undefined,
      events: [
        ...schedule.events,
        new EditTaskEvent(updatedTask.toDto(), originalTask),
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

  on(TasksActions.get, (schedule) => {
    return {
      ...schedule,
      loadingState: TasksLoadingState.Loading,
    };
  }),

  on(TasksActions.getSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks,
      loadingState: TasksLoadingState.Loaded,
    };
  }),

  on(TasksActions.getFailed, (schedule, { error }) => {
    return {
      ...schedule,
      loadingState: TasksLoadingState.Error,
    };
  }),

  on(
    TasksActions.removeSuccess,
    (schedule, { removedTaskId: deletedTaskId, affectedTask }) => {
      const newTasks: Array<Task> = [];

      let deletedTaskDto;
      for (const task of schedule.tasks) {
        // cache the deleted task dto to allow for it to be restored later
        if (task.id === deletedTaskId) {
          deletedTaskDto = task.toDto();
          continue;
        }

        // skip the affected task which needs to be updated
        if (task.id === affectedTask?.id) continue;

        newTasks.push(task);
      }

      // the affected task will be null when the first element is deleted
      if (affectedTask) newTasks.push(affectedTask);

      return {
        ...schedule,
        tasks: newTasks,
        events: [
          ...schedule.events,
          // purposedly not signaling the affected task's move
          new DeleteTaskEvent(deletedTaskDto as TaskDto),
        ],
      };
    }
  ),

  /* Tags */

  on(TasksActions.getTagsSuccess, (state, { tags }) => {
    // remove fetched tags colours from the available list
    const usedColours = tags.map((tag) => tag.colour);
    return {
      ...state,
      tags,
      availableTagColours: baseTagColours.filter(
        (colour) => !usedColours.includes(colour)
      ),
    };
  }),
  // tk turn availableTagColours into a selector

  on(TasksActions.addTagSuccess, (state, { tagDto }) => ({
    ...state,
    tags: [...state.tags, tagDto],
  })),

  on(TasksActions.editTagSuccess, (state, { tagDto }) => ({
    ...state,
    tags: [...state.tags.filter((tag) => tag.id !== tagDto.id), tagDto],
  }))
);
