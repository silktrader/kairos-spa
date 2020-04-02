import { createReducer, on } from '@ngrx/store';
import { ScheduleState } from '../models/schedule';
import * as ScheduleActions from './schedule.actions';
import { Task } from '../models/task';

export const initialState: ScheduleState = {
  tasks: [],
  loadingTasks: false,
  updatingTasks: []
};

export const removeTasksByIds = (
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

export const taskReducer = createReducer(
  initialState,

  on(ScheduleActions.addTask, (schedule, { task }) => {
    return {
      ...schedule
    };
  }),

  on(ScheduleActions.addTaskSuccess, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: [...schedule.tasks, task]
    };
  }),

  on(ScheduleActions.updateTask, (schedule, { task }) => {
    return {
      ...schedule,
      updatingTasks: [...schedule.updatingTasks, task.id]
    };
  }),

  on(ScheduleActions.updateTaskSuccess, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: [...removeTasksByIds(schedule.tasks, task.id), task],
      updatingTasks: schedule.updatingTasks.filter(taskId => taskId !== task.id)
    };
  }),

  on(ScheduleActions.updateTasks, (schedule, { tasksDtos }) => {
    return {
      ...schedule,
      updatingTasks: [
        ...schedule.updatingTasks,
        ...tasksDtos.map(task => task.id)
      ]
    };
  }),

  on(ScheduleActions.updateTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks: [
        ...removeTasksByIds(schedule.tasks, ...tasks.map(task => task.id)),
        ...tasks
      ],
      updatingTasks: []
    };
  }),

  on(ScheduleActions.getDatesTasks, schedule => {
    return {
      ...schedule,
      loadingTasks: true
    };
  }),

  on(ScheduleActions.getDatesTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks,
      loadingTasks: false
    };
  }),

  on(ScheduleActions.repositionTasks, (schedule, { tasks }) => {
    // mark the tasks which are being replaced
    const substitutedTasksIds = new Set<number>(tasks.map(task => task.id));
    return {
      ...schedule,
      tasks: [
        ...schedule.tasks.filter(task => !substitutedTasksIds.has(task.id)),
        ...tasks
      ]
    };
  }),

  on(
    ScheduleActions.deleteTaskSuccess,
    (schedule, { deletedTaskId, affectedTask }) => {
      // replace the affected task and filter out the removed one
      const newTasks = schedule.tasks.filter(
        task => task.id !== deletedTaskId && task.id !== affectedTask?.id
      );

      // the affected task will be null when the first element is deleted
      if (affectedTask) {
        newTasks.push(affectedTask);
      }

      return {
        ...schedule,
        tasks: newTasks
      };
    }
  )
);
