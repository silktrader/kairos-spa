import { Task } from './task';
import { format, isToday } from 'date-fns';

export class Day {
  constructor(
    public readonly date: Date,
    public readonly tasks: ReadonlyArray<Task>
  ) {}

  public get dayName(): string {
    return format(this.date, 'cccc');
  }

  public get daySubtitle(): string {
    // prettier-ignore
    return format(this.date, 'LLLL d');
  }

  public get isCurrentDay(): boolean {
    return isToday(this.date);
  }

  public get url(): string {
    return format(this.date, 'yyyy-MM-dd');
  }
}
