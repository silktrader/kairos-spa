import { createSelector } from '@ngrx/store';
import { Schedule } from '../models/schedule';
import { Day } from '../models/day';

export interface FeatureState {
  days: ReadonlyArray<Day>;
}

export const selectFeature = (state: any) => state.schedule;

export const selectDays = createSelector(
  selectFeature,
  (state: FeatureState) => state.days
);
