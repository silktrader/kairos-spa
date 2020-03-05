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
    return format(this.date, 'LLLL\', the\' do');
  }

  public get isCurrentDay(): boolean {
    return isToday(this.date);
  }
}
