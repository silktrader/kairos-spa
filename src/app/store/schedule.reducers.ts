import { createReducer, on } from '@ngrx/store';
import { Schedule } from '../models/schedule';
import * as ScheduleActions from './schedule.actions';

// build a test initial schedule without recurring to backends
export const buildSampleSchedule = (): Schedule => {
  return { tasks: [] };
};

export const initialState = buildSampleSchedule();

export const taskReducer = createReducer(
  initialState,

  on(ScheduleActions.addTask, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: [...schedule.tasks, task]
    };
  }),

  on(ScheduleActions.setTasks, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks
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
    ScheduleActions.deleteTask,
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
