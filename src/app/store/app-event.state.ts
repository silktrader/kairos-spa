import { TaskDto } from '../tasks/models/task.dto';
import { generate } from 'shortid';
import { HabitDto } from '../habits/models/habit.dto';
import { EventOperation } from './event-operation.enum';

export abstract class AppEvent {
  public readonly id = generate();
  public readonly operation: EventOperation;
  public readonly timestamp = Date.now();

  abstract get title(): string;
}

export abstract class TaskEvent extends AppEvent {
  constructor(public readonly task: TaskDto) {
    super();
  }

  get title(): string {
    return this.task.title;
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

export class GenericTaskEvent extends AppEvent {
  operation = EventOperation.Update;
  title = 'tasks';

  constructor() {
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
    public readonly task: TaskDto,
    public readonly originalTaskDto: TaskDto
  ) {
    super(task);
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
