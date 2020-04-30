export interface TaskDto {
  id: number;
  previousId: number | null;
  date: string;
  title: string;
  details: string | null;
  complete: boolean;
  duration: number | null;
  tags: Array<string>;
}
