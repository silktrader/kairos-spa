import { HabitDto } from '../models/habit.dto';
import { HabitEntryDto } from '../models/habit-entry.dto';

export interface HabitsState {
  habits: ReadonlyArray<HabitDto>;
  entries: ReadonlyArray<HabitEntryDto>;
  editingHabit: boolean;
}
