export class NewTasksPositionsDto {
  tasks: ReadonlyArray<{ taskId: number; previousId: number | null }>;
}
