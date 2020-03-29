export class Task {
  constructor(
    public readonly id: number,
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string,
    public readonly complete: boolean,
    public readonly previousId?: number
  ) {}
}
