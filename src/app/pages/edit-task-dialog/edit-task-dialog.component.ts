import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Task } from 'src/app/models/task';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DayService } from 'src/app/services/day.service';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from 'src/app/models/schedule';
import { updateTask } from 'src/app/store/schedule.actions';
import {
  selectTaskUpdating,
  selectTaskById
} from 'src/app/store/schedule.selectors';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent implements OnInit {
  taskForm = this.formBuilder.group(
    {
      title: undefined,
      details: undefined,
      date: undefined
    },
    { updateOn: 'blur' }
  );

  taskUpdating$ = this.store.pipe(
    select(selectTaskUpdating, { id: this.initialTask.id })
  );

  task$ = this.store.pipe(select(selectTaskById, { id: this.initialTask.id }));
  changeNotice$ = new BehaviorSubject<string>('');

  private readonly subscription = new Subscription();
  private changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly ds: DayService,
    private readonly store: Store<ScheduleState>
  ) {}

  ngOnInit(): void {
    this.resetForm();

    this.subscription.add(
      this.taskForm.valueChanges.subscribe(() => this.saveTask())
    );

    this.task$.subscribe(task => {
      if (this.changed) {
        this.changeNotice$.next('... changes saved');
        setTimeout(() => this.changeNotice$.next(''), 8000);
      }
    });

    this.taskForm
      .get('title')
      ?.statusChanges.subscribe(change => console.log(change));
  }

  public resetForm() {
    if (this.initialTask) {
      this.taskForm.patchValue(this.initialTask);
    } else {
      this.taskForm.reset();
    }
  }

  saveTask(): void {
    this.changed = true;
    // merge data with spread operator
    this.store.dispatch(
      updateTask({ task: { ...this.initialTask, ...this.taskForm.value } })
    );
  }

  deleteTask(): void {
    // the ID of a task won't ever change since inception
    this.ds.deleteTask(this.initialTask.id);

    // tk should check for effective deletion by listening to observable?
    this.dialogRef.close();
  }

  public get hasChanged(): boolean {
    return this.changed;
  }
}
