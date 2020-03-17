import { Component, OnInit, Input } from '@angular/core';
import { Day } from 'src/app/models/day';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit {
  @Input() date: Date;

  tasks$: Observable<ReadonlyArray<Task>>;

  newNoteFormControl = new FormControl('');

  constructor(private ds: DayService) {}

  ngOnInit(): void {
    this.tasks$ = this.ds.getDayTasks(this.date);
  }

  addTask(value: string): void {
    this.ds.addTask({
      date: this.date,
      title: value,
      details: '',
      order: 1
    });
    this.newNoteFormControl.reset();
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
