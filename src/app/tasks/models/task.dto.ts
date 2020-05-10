export interface TaskDto {
  readonly id: number;
  readonly title: string;
  readonly complete: boolean;

  readonly previousId: number | null;
  readonly date: string | null;
  readonly details: string | null;
  readonly duration: number | null;

  readonly tags: ReadonlyArray<string>;
}
