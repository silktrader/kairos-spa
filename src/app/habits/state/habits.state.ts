import { HabitDto } from '../models/habit.dto';
import { HabitEntryDto } from '../models/habit-entry.dto';
import { HabitEvent } from 'src/app/store/app-event.state';

export interface HabitsState {
  habits: ReadonlyArray<HabitDto>;
  entries: ReadonlyArray<HabitEntryDto>;
  events: ReadonlyArray<HabitEvent>;
  editingHabit: boolean;
}
