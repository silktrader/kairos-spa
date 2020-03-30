import { TaskDto } from './dtos/task.dto';
import { isEqual } from 'date-fns';

export class Task {
  constructor(
    public readonly id: number,
    public readonly previousId: number | null,
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string | null,
    public readonly complete: boolean,
    public readonly duration: number | null
  ) {}

  hasDifferentContents(taskDto: TaskDto): boolean {
    if (
      this.title !== taskDto.title ||
      this.details !== taskDto.details ||
      this.complete !== taskDto.complete ||
      (taskDto.duration && this.duration !== taskDto.duration)
    ) {
      return true;
    }

    if (!isEqual(this.date, taskDto.date)) {
      return true;
    }

    return false;
  }
}
