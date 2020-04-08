import { TaskEventOperation } from './task-event-operation.enum';
import { TaskDto } from '../models/dtos/task.dto';
import { generate } from 'shortid';

export abstract class TaskEvent {
  public readonly id = generate();
  public readonly operation: TaskEventOperation;
  public readonly timestamp = Date.now();
  public readonly read: boolean = false;

  constructor(public readonly taskDto: TaskDto) {}
}

export class AddTaskEvent extends TaskEvent {
  public readonly undoable = true;
  operation = TaskEventOperation.Add;
}

export class RemoveTaskEvent extends TaskEvent {
  public readonly undoable = true;
  operation = TaskEventOperation.Remove;
}

export class EditTaskEvent extends TaskEvent {
  operation = TaskEventOperation.Edit;

  constructor(
    public readonly taskDto: TaskDto,
    public readonly originalDto: TaskDto
  ) {
    super(taskDto);
  }
}
