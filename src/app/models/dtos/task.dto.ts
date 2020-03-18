export interface TaskDto {
  id: number;
  date: Date;
  title: string;
  details?: string;
  previousId?: number;
}
