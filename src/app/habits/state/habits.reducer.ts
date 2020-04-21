import { createReducer, on } from '@ngrx/store';
import { HabitsState } from './habits.state';
import {
  addHabitSuccess,
  editHabit,
  editHabitSuccess,
  deleteHabit,
  deleteHabitSuccess,
  getHabitsSuccess,
  getHabitsEntriesSuccess,
  addHabitEntrySuccess,
  deleteHabitEntrySuccess,
} from './habits.actions';
import {
  AddHabitEvent,
  EditHabitEvent,
  DeleteHabitEvent,
} from 'src/app/store/app-event.state';

export const initialState: HabitsState = {
  habits: [],
  entries: [],
  events: [],
  editingHabit: false,
};

export const habitsReducer = createReducer(
  initialState,
  on(addHabitSuccess, (state, { habit }) => {
    return {
      ...state,
      habits: [...state.habits, habit],
      events: [...state.events, new AddHabitEvent(habit)],
    };
  }),

  on(editHabit, (state) => {
    return {
      ...state,
      editingHabit: true,
    };
  }),

  on(editHabitSuccess, (state, { habit }) => {
    let originalHabit = habit; // avoids null checks
    const habits = [habit]; // order will be calculated by components
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

  on(deleteHabit, (state, { habit }) => {
    return {
      ...state,
      editingHabit: true,
    };
  }),

  on(deleteHabitSuccess, (state, { habit }) => {
    return {
      ...state,
      habits: [...state.habits.filter((item) => item.id !== habit.id)],
      entries: [...state.entries.filter((entry) => entry.habitId !== habit.id)],
      events: [...state.events, new DeleteHabitEvent(habit)],
      editingHabit: false,
    };
  }),

  on(getHabitsSuccess, (state, { habits }) => {
    return {
      ...state,
      habits,
    };
  }),

  on(getHabitsEntriesSuccess, (state, { habitsEntries }) => {
    return {
      ...state,
      entries: habitsEntries,
    };
  }),

  on(addHabitEntrySuccess, (state, { habitEntry }) => {
    return {
      ...state,
      entries: [...state.entries, habitEntry],
    };
  }),

  on(deleteHabitEntrySuccess, (state, { habitEntry }) => {
    return {
      ...state,
      entries: state.entries.filter(
        (entry) =>
          entry.date !== habitEntry.date || entry.habitId !== habitEntry.habitId
      ),
    };
  })
);
