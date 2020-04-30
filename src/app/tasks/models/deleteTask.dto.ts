import { Task } from './task';

export interface DeleteTaskDto {
  affectedTask: Task | null;
}
