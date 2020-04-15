import { createReducer, on } from '@ngrx/store';
import * as ScheduleActions from './schedule.actions';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';
import { ScheduleState, SidebarSection } from './app-state';
import {
  AddTaskEvent,
  RemoveTaskEvent,
  EditTaskEvent,
  AddHabitEvent,
  EditHabitEvent,
  DeleteHabitEvent,
} from './task-event.interface';

export const initialState: ScheduleState = {
  tasks: [],
  habits: [],
  habitsEntries: [],
  loadingTasks: false,
  editingHabit: false,
  editingTaskId: undefined,
  events: [],
  sidebar: { opened: true, section: SidebarSection.Habits },
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
      events: [...schedule.events, new AddTaskEvent(task.toDto())],
    };
  }),

  on(ScheduleActions.updateTask, (schedule, { updatedTask: task }) => {
    return {
      ...schedule,
      editingTaskId: task.id,
    };
  }),

  on(
    ScheduleActions.updateTaskSuccess,
    (schedule, { originalTask, updatedTask }) => {
      return {
        ...schedule,
        tasks: [...filteredTasks(schedule.tasks, updatedTask.id), updatedTask],
        editingTaskId: undefined,
        events: [
          ...schedule.events,
          new EditTaskEvent(updatedTask, originalTask),
        ],
      };
    }
  ),

  on(ScheduleActions.updateTasks, (schedule, { tasksDtos }) => {
    return {
      ...schedule,
      updatingTasks: [...tasksDtos.map((task) => task.id)],
    };
  }),

  on(ScheduleActions.updateTasksSuccess, (schedule, { tasks }) => {
    return {
      ...schedule,
      tasks: [
        ...filteredTasks(schedule.tasks, ...tasks.map((task) => task.id)),
        ...tasks,
      ],
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
        events: [
          ...schedule.events,
          // purposedly not signaling the affected task's move
          new RemoveTaskEvent(deletedTaskDto as TaskDto),
        ],
      };
    }
  ),

  on(ScheduleActions.readTaskEvent, (schedule, { id: id }) => {
    const newEvents = [...schedule.events];
    for (let i = 0; i < newEvents.length; i++) {
      if (newEvents[i].id === id) {
        newEvents[i] = newEvents[i].setAsRead();
        break;
      }
    }
    return {
      ...schedule,
      events: newEvents,
    };
  }),

  /* Habits */

  on(ScheduleActions.addHabitSuccess, (state, { habit }) => {
    return {
      ...state,
      habits: [...state.habits, habit],
      events: [...state.events, new AddHabitEvent(habit)],
    };
  }),

  on(ScheduleActions.editHabit, (state) => {
    return {
      ...state,
      editingHabit: true,
    };
  }),

  on(ScheduleActions.editHabitSuccess, (state, { habit }) => {
    let originalHabit = habit; // avoids null checks
    const habits = [];
    for (const item of state.habits) {
      if (item.id === habit.id) originalHabit = item;
      else habits.push(item);
    }
    return {
      ...state,
      habits,
      editingHabit: false,
      events: [...state.events, new EditHabitEvent(habit, originalHabit)],
    };
  }),

  on(ScheduleActions.deleteHabit, (state, { habit }) => {
    return {
      ...state,
      editingHabit: true,
    };
  }),

  on(ScheduleActions.deleteHabitSuccess, (state, { habit }) => {
    return {
      ...state,
      habits: [...state.habits.filter((item) => item.id !== habit.id)],
      habitsEntries: [
        ...state.habitsEntries.filter((entry) => entry.habitId !== habit.id),
      ],
      events: [...state.events, new DeleteHabitEvent(habit)],
      editingHabit: false,
    };
  }),

  on(ScheduleActions.getHabitsSuccess, (state, { habits }) => {
    return {
      ...state,
      habits,
    };
  }),

  on(ScheduleActions.getHabitsEntriesSuccess, (state, { habitsEntries }) => {
    return {
      ...state,
      habitsEntries,
    };
  }),

  on(ScheduleActions.addHabitEntrySuccess, (state, { habitEntry }) => {
    return {
      ...state,
      habitsEntries: [...state.habitsEntries, habitEntry],
    };
  }),

  on(ScheduleActions.deleteHabitEntrySuccess, (state, { habitEntry }) => {
    return {
      ...state,
      habitsEntries: state.habitsEntries.filter(
        (entry) =>
          entry.date !== habitEntry.date || entry.habitId !== habitEntry.habitId
      ),
    };
  }),

  /* User Interface Controls */

  on(ScheduleActions.toggleSidebar, (state, { opened, section }) => {
    return { ...state, sidebar: { opened, section } };
  })
);
