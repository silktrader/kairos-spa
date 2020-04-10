import { createReducer, on } from '@ngrx/store';
import * as ScheduleActions from './schedule.actions';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';
import { ScheduleState } from './schedule';
import {
  AddTaskEvent,
  RemoveTaskEvent,
  EditTaskEvent,
} from './task-event.interface';

export const initialState: ScheduleState = {
  tasks: [],
  habits: [],
  loadingTasks: false,
  updatingTasks: [],
  taskEvents: [],
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

export const taskReducer = createReducer(
  initialState,

  on(ScheduleActions.addTask, (schedule, { task }) => {
    return {
      ...schedule,
    };
  }),

  on(ScheduleActions.addTaskSuccess, (schedule, { task }) => {
    return {
      ...schedule,
      tasks: [...schedule.tasks, task],
      taskEvents: [...schedule.taskEvents, new AddTaskEvent(task.toDto())],
    };
  }),

  on(ScheduleActions.updateTask, (schedule, { updatedTask: task }) => {
    return {
      ...schedule,
      updatingTasks: [...schedule.updatingTasks, task.id],
    };
  }),

  on(
    ScheduleActions.updateTaskSuccess,
    (schedule, { originalTask, updatedTask }) => {
      return {
        ...schedule,
        tasks: [...filteredTasks(schedule.tasks, updatedTask.id), updatedTask],
        updatingTasks: schedule.updatingTasks.filter(
          (taskId) => taskId !== updatedTask.id
        ),
        taskEvents: [
          ...schedule.taskEvents,
          new EditTaskEvent(updatedTask, originalTask),
        ],
      };
    }
  ),

  on(ScheduleActions.updateTasks, (schedule, { tasksDtos }) => {
    return {
      ...schedule,
      updatingTasks: [
        ...schedule.updatingTasks,
        ...tasksDtos.map((task) => task.id),
      ],
    };
  }),

  on(ScheduleActions.updateTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks: [
        ...filteredTasks(schedule.tasks, ...tasks.map((task) => task.id)),
        ...tasks,
      ],
      updatingTasks: [],
      // taskEvents: [
      //   ...schedule.taskEvents,
      //   ...tasks.map((task) => {
      //     return {
      //       id: generate(),
      //       timestamp: Date.now(),
      //       operation: TaskEventOperation.Update,
      //       taskDto: task.toDto(),
      //       read: false,
      //       undoable: true,
      //     };
      //   }),
      // ],
    };
  }),

  on(ScheduleActions.getDatesTasks, (schedule) => {
    return {
      ...schedule,
      loadingTasks: true,
    };
  }),

  on(ScheduleActions.getDatesTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks,
      loadingTasks: false,
    };
  }),

  on(
    ScheduleActions.deleteTaskSuccess,
    (schedule, { deletedTaskId, affectedTask }) => {
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
        taskEvents: [
          ...schedule.taskEvents,
          // purposedly not signaling the affected task's move
          new RemoveTaskEvent(deletedTaskDto as TaskDto),
        ],
      };
    }
  ),

  on(ScheduleActions.readTaskEvent, (schedule, { id: id }) => {
    const newEvents = [...schedule.taskEvents];
    for (let i = 0; i < newEvents.length; i++) {
      if (newEvents[i].id === id) {
        newEvents[i] = { ...newEvents[i], read: true };
        break;
      }
    }
    return {
      ...schedule,
      taskEvents: newEvents,
    };
  }),

  on(ScheduleActions.addHabitSuccess, (schedule, { habit }) => {
    return {
      ...schedule,
      habits: [...schedule.habits, habit],
    };
  }),

  on(ScheduleActions.getHabitsSuccess, (schedule, { habits }) => {
    return {
      ...schedule,
      habits,
    };
  })
);
