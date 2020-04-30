export class Task {
  constructor(
    public readonly id: number,
    public readonly previousId: number | null,
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string | null,
    public readonly complete: boolean,
    public readonly duration: number | null,
    public readonly tags: Array<string>
  ) {}
}
