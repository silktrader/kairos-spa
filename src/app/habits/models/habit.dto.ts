import { HabitEntryDto } from './habit-entry.dto';

export interface HabitDto {
  id: number;
  title: string;
  description: string;
  colour: string;
}

export interface HabitDetails extends HabitDto {
  entry: HabitEntryDto | undefined;
}
