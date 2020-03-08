import { createReducer, on } from '@ngrx/store';
import { Schedule } from '../models/schedule';
import { Day } from '../models/day';
import { addDays } from 'date-fns';
import { Task } from '../models/task';
import * as ScheduleActions from './schedule.actions';

// build a test initial schedule without recurring to backends
export const buildSampleSchedule = (): Schedule => {
  const initialDate = addDays(new Date(), -2);
  const days = [];

  for (let index = 0; index < 5; index++) {
    days.push(
      new Day(addDays(initialDate, index), [
        new Task('Task #1'),
        new Task('Task #2')
      ])
    );
  }
  return { days };
};

export const initialState = buildSampleSchedule();

export const taskReducer = createReducer(
  initialState,
  on(ScheduleActions.addTask, (schedule, { day, task }) => {
    // substitute the selected day with a new instance containing the new task
    const newDays = [...schedule.days];
    const index = newDays.findIndex(item => item.date === day.date);
    newDays[index] = new Day(newDays[index].date, [
      ...newDays[index].tasks,
      task
    ]);
    return {
      ...schedule,
      days: newDays
    };
  }),
  on(ScheduleActions.deleteTask, (schedule, { day, task }) => {
    const newDays = [...schedule.days];
    const dayIndex = newDays.findIndex(item => item.date === day.date);
    // tk replace with id?
    const taskIndex = newDays[dayIndex].tasks.findIndex(
      item => item.content === task.content
    );
    const newTasks = [...newDays[dayIndex].tasks];
    newTasks.splice(taskIndex, 1);
    newDays[dayIndex] = new Day(newDays[dayIndex].date, newTasks);
    return {
      ...schedule,
      days: newDays
    };
  })
);
