import { createAction, props } from '@ngrx/store';
import { HabitDto } from '../models/habit.dto';
import { HabitEntryDto } from '../models/habit-entry.dto';

export const addHabit = createAction(
  '[HABITS] Add',
  props<{ habit: HabitDto }>()
);

export const addHabitSuccess = createAction(
  '[HABITS] Add Success',
  props<{ habit: HabitDto }>()
);

export const editHabit = createAction(
  '[HABITS] Edit',
  props<{ habit: HabitDto }>()
);

export const editHabitSuccess = createAction(
  '[HABITS] Edit Success',
  props<{ habit: HabitDto }>()
);

export const deleteHabit = createAction(
  '[HABITS] Delete',
  props<{ habit: HabitDto }>()
);

export const deleteHabitSuccess = createAction(
  '[HABITS] Delete Success',
  props<{ habit: HabitDto }>()
);

export const getHabits = createAction('[HABITS] Get');

export const getHabitsSuccess = createAction(
  '[HABITS] Get Success',
  props<{ habits: ReadonlyArray<HabitDto> }>()
);

export const getHabitsEntries = createAction(
  '[HABITS] Get Entries',
  props<{ dates: ReadonlyArray<string> }>()
);

export const getHabitsEntriesSuccess = createAction(
  '[HABITS] Get Entries Success',
  props<{ habitsEntries: ReadonlyArray<HabitEntryDto> }>()
);

export const addHabitEntry = createAction(
  '[HABITS] Add Entry',
  props<{ habitEntry: Omit<HabitEntryDto, 'id'> }>()
);

export const addHabitEntrySuccess = createAction(
  '[HABITS] Add Entry Success',
  props<{ habitEntry: HabitEntryDto }>()
);

export const addHabitEntryFailure = createAction(
  '[HABITS] Add Entry Failure',
  props<{ habitEntry: HabitEntryDto }>()
);

export const deleteHabitEntry = createAction(
  '[HABITS] Delete Entry',
  props<{ habitEntry: HabitEntryDto }>()
);

export const deleteHabitEntrySuccess = createAction(
  '[HABITS] Delete Entry Success',
  props<{ habitEntry: HabitEntryDto }>()
);
