import { Day } from './day';
import { Task } from './task';

describe('Day', () => {
  it('should create an instance', () => {
    expect(new Day(new Date(), [new Task('Task')])).toBeTruthy();
  });
});
