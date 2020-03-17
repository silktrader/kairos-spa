import { createReducer, on } from '@ngrx/store';
import { Schedule } from '../models/schedule';
import { Day } from '../models/day';
import { addDays } from 'date-fns';
import { Task } from '../models/task';
import * as ScheduleActions from './schedule.actions';

// build a test initial schedule without recurring to backends
export const buildSampleSchedule = (): Schedule => {
  // const initialDate = addDays(new Date(), -2);
  // const days = [];

  // for (let index = 0; index < 5; index++) {
  //   days.push(new Day(addDays(initialDate, index), []));
  // }
  // return { days };
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

  on(ScheduleActions.deleteTask, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: schedule.tasks.filter(item => item.id !== task.id)
    };
  })
);
