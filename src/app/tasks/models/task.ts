import { TaskDto } from './task.dto';
import { format } from 'date-fns';

export class Task {
  public readonly dateString = Task.getDateString(this.date);

  constructor(
    public readonly id: number,
    public readonly previousId: number | null,
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string | null,
    public readonly complete: boolean,
    public readonly duration: number | null,
    public readonly tags: Array<string>
  ) {}

  public static getDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  hasDifferentContents(taskDto: TaskDto): boolean {
    if (
      this.title !== taskDto.title ||
      this.details !== taskDto.details ||
      this.complete !== taskDto.complete ||
      (taskDto.duration && this.duration !== taskDto.duration)
    ) {
      return true;
    }

    // compare formatted dates
    if (this.dateString !== taskDto.date) return true;

    // determine whether the tags are the same
    if (this.tags.length !== taskDto.tags.length) return true;
    for (let i = 0; i < this.tags.length; i++) {
      if (this.tags[i] !== taskDto.tags[i]) return true;
    }

    return false;
  }

  // tk move to mapper or use class-transformer
  toDto(): TaskDto {
    return {
      ...this,
      date: this.dateString,
    };
  }
}
