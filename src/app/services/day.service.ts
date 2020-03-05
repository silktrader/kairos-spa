import { Injectable } from '@angular/core';
import { Day } from 'src/app/models/day';
import { Task } from '../models/task';
import { addDays } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  constructor() {}

  getDay(date: Date): Day {
    return new Day(date, [new Task('Task #1'), new Task('Task #2')]);
  }

  getDayBefore(date: Date): Day {
    return this.getDay(addDays(date, -1));
  }

  getDayAfter(date: Date): Day {
    return this.getDay(addDays(date, 1));
  }
}
