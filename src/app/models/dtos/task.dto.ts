export interface TaskDto {
  id: number;
  date: Date;
  title: string;
  complete: boolean;
  details?: string;
  previousId?: number;
}
