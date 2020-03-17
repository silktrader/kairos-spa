export class Task {
  constructor(
    public readonly date: Date,
    public readonly title: string,
    public readonly details: string,
    public readonly order: number,
    public readonly id?: number
  ) {}
}
