import { createSelector, createFeatureSelector } from '@ngrx/store';
import { HabitsState } from './habits.state';
import { isSameDay } from 'date-fns';
import { HabitEntryDto } from '../models/habit-entry.dto';

export const selectHabitsFeature = createFeatureSelector<HabitsState>('habits');

export const selectHabits = createSelector(
  selectHabitsFeature,
  (state) => state.habits
);

export const selectEntries = createSelector(
  selectHabitsFeature,
  (state) => state.entries
);

export const selectHabitsEntries = createSelector(
  selectEntries,
  (entries: Array<HabitEntryDto>, props: { date: Date }) => {
    return entries.filter((entry) => isSameDay(entry.date, props.date));
  }
);

export const selectHabitsEvents = createSelector(
  selectHabitsFeature,
  (state) => state.events
);
