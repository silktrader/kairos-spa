export interface TaskDto {
  id: number;
  date: Date;
  title: string;
  complete: boolean;
  duration?: number;
  details?: string;
  previousId?: number;
}
