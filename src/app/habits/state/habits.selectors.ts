import { createSelector, createFeatureSelector } from '@ngrx/store';
import { HabitsState } from './habits.state';
import { isSameDay } from 'date-fns';
import { HabitEntryDto } from '../models/habit-entry.dto';
import { HabitDetails } from '../models/habit.dto';

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
  (entries: Array<HabitEntryDto>, props: { date: string }) => {
    return entries.filter((entry) => entry.date === props.date);
  }
);

export const selectHabitsEvents = createSelector(
  selectHabitsFeature,
  (state) => state.events
);

export const selectHabitsDetails = createSelector(
  selectHabits,
  selectHabitsEntries,
  (habits, entries) => {
    const habitsDetails: Array<HabitDetails> = [];
    for (const habit of habits) {
      habitsDetails.push({
        ...habit,
        entry: entries.find((item) => item.habitId === habit.id),
      });
    }
    return habitsDetails;
  }
);
