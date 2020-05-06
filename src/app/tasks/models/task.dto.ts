export interface TaskDto {
  readonly id: number;
  readonly previousId: number | null;
  readonly date: string;
  readonly title: string;
  readonly details: string | null;
  readonly complete: boolean;
  readonly duration: number | null;
  readonly tags: ReadonlyArray<string>;
}
