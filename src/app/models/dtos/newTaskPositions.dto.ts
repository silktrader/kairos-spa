export class NewTasksPositionsDto {
  tasks: ReadonlyArray<{ taskId: number; previousId: number | undefined }>;
}
