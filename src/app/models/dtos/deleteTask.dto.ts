import { Task } from '../task';

export interface DeleteTaskDto {
  deletedTaskId: number;
  affectedTask: Task | null;
}
