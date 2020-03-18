import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Day } from 'src/app/models/day';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;

  tasks$: Observable<ReadonlyArray<Task>>;

  private lastTaskId: number;
  private subscriptions = new Subscription();

  newTaskControl = new FormControl('');

  constructor(private ds: DayService) {}

  ngOnInit(): void {
    this.tasks$ = this.ds.getDayTasks(this.date);
    this.tasks$.subscribe(tasks => {
      this.lastTaskId = tasks[tasks.length - 1]?.id;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addTask(title: string): void {
    this.ds.addTask({
      date: this.date,
      title,
      id: 0, // tk diff between get and post dto,
      previousId: this.lastTaskId
    });
    this.newTaskControl.reset();
  }

  deleteTask(task: Task): void {
    this.ds.deleteTask(task);
  }

  get isToday(): boolean {
    return this.ds.isToday(this.date);
  }

  get dayName(): string {
    return this.ds.getDayName(this.date);
  }

  get daySubtitle(): string {
    return this.ds.getDaySubtitle(this.date);
  }
}
