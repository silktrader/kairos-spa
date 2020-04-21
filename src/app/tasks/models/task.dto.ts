export interface TaskDto {
  id: number;
  previousId: number | null;
  date: Date;
  title: string;
  details: string | null;
  complete: boolean;
  duration: number | null;
}
