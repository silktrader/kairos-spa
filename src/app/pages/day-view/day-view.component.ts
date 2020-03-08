import { Component, OnInit, Input } from '@angular/core';
import { Day } from 'src/app/models/day';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Schedule } from 'src/app/models/schedule';
import { Store } from '@ngrx/store';
import { addTask, deleteTask } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit {
  @Input() day: Day;

  newNoteFormControl = new FormControl('');

  constructor(private store: Store<Schedule>, private ds: DayService) {}

  ngOnInit(): void {}

  onEnter(value: string): void {
    this.ds.addTask(new Task(value), this.day);
    this.newNoteFormControl.reset();
  }

  deleteTask(task: Task): void {
    this.ds.deleteTask(task, this.day);
  }
}
