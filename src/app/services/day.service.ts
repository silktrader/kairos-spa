import { Injectable } from '@angular/core';
import { Day } from 'src/app/models/day';
import { Task } from '../models/task';
import { addDays } from 'date-fns';
import { Store } from '@ngrx/store';
import { addTask, deleteTask } from '../store/schedule.actions';
import { Schedule } from '../models/schedule';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  constructor(private store: Store<Schedule>) {}

  getDay(date: Date): Day {
    return new Day(date, [new Task('Task #1'), new Task('Task #2')]);
  }

  getDayBefore(date: Date): Day {
    return this.getDay(addDays(date, -1));
  }

  getDayAfter(date: Date): Day {
    return this.getDay(addDays(date, 1));
  }

  // tk use post {date}/tasks
  addTask(task: Task, day: Day): void {
    this.store.dispatch(addTask({ day, task }));
  }

  // tk use delete {date}/tasks/{id}
  deleteTask(task: Task, day: Day): void {
    this.store.dispatch(deleteTask({ day, task }));
  }
}
