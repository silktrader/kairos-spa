export class Task {
  constructor(
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string,
    public readonly id: number,
    public readonly previousId?: number
  ) {}
}
