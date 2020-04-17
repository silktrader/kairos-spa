import { TaskDto } from '../models/dtos/task.dto';
import { generate } from 'shortid';
import { HabitDto } from '../models/dtos/habit.dto';
import { EventOperation } from './task-event-operation.enum';

export abstract class AppEvent {
  public readonly id = generate();
  public readonly operation: EventOperation;
  public readonly timestamp = Date.now();
  public readonly read: boolean = false;

  abstract get title(): string;

  public setAsRead(): AppEvent {
    return { ...this, read: true };
  }
}

export abstract class TaskEvent extends AppEvent {
  constructor(public readonly taskDto: TaskDto) {
    super();
  }

  get title(): string {
    return this.taskDto.title;
  }
}

export class HabitEvent extends AppEvent {
  get title(): string {
    return this.habit.title;
  }

  constructor(public readonly habit: HabitDto) {
    super();
  }
}

export class ErrorEvent extends AppEvent {
  constructor(public readonly title: string, public readonly message: string) {
    super();
  }
}

export class AddTaskEvent extends TaskEvent {
  operation = EventOperation.AddedTask;
}

export class DeleteTaskEvent extends TaskEvent {
  operation = EventOperation.DeletedTask;
}

export class EditTaskEvent extends TaskEvent {
  operation = EventOperation.EditedTask;

  constructor(
    public readonly taskDto: TaskDto,
    public readonly originalDto: TaskDto
  ) {
    super(taskDto);
  }
}

export class AddHabitEvent extends HabitEvent {
  operation = EventOperation.AddedHabit;
}

export class EditHabitEvent extends HabitEvent {
  operation = EventOperation.EditedHabit;

  constructor(
    public readonly habit: HabitDto,
    public readonly originalHabit: HabitDto
  ) {
    super(habit);
  }
}

export class DeleteHabitEvent extends HabitEvent {
  operation = EventOperation.DeletedHabit;
}
