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

export class AddTaskEvent extends AppEvent {
  get title(): string {
    return this.taskDto.title;
  }
  operation = EventOperation.AddTask;

  constructor(public readonly taskDto: TaskDto) {
    super();
  }
}

export class RemoveTaskEvent extends AppEvent {
  get title(): string {
    return this.taskDto.title;
  }
  operation = EventOperation.RemoveTask;

  constructor(public readonly taskDto: TaskDto) {
    super();
  }
}

export class EditTaskEvent extends AppEvent {
  get title(): string {
    return this.taskDto.title;
  }
  operation = EventOperation.EditTask;

  constructor(
    public readonly taskDto: TaskDto,
    public readonly originalDto: TaskDto
  ) {
    super();
  }
}

export class AddHabitEvent extends AppEvent {
  get title(): string {
    return this.habit.title;
  }
  operation = EventOperation.AddHabit;

  constructor(public readonly habit: HabitDto) {
    super();
  }
}

export class EditHabitEvent extends AppEvent {
  get title(): string {
    return this.habit.title;
  }
  operation = EventOperation.EditHabit;

  constructor(
    public readonly habit: HabitDto,
    public readonly originalHabit: HabitDto
  ) {
    super();
  }
}

export class DeleteHabitEvent extends AppEvent {
  get title(): string {
    return this.habit.title;
  }
  operation = EventOperation.DeleteHabit;

  constructor(public readonly habit: HabitDto) {
    super();
  }
}
