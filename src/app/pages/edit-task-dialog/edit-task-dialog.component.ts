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
      date: undefined,
      complete: false
    },
    { updateOn: 'blur' }
  );

  taskUpdating$ = this.store.pipe(
    select(selectTaskUpdating, { id: this.initialTask.id })
  );

  task$ = this.store.pipe(select(selectTaskById, { id: this.initialTask.id }));
  readonly changeNotice$ = new BehaviorSubject<string>('');
  readonly canRevert$ = new BehaviorSubject<boolean>(false);

  private task: Task;

  private readonly subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly ds: DayService,
    private readonly store: Store<ScheduleState>
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.taskForm.valueChanges.subscribe(changes => {
        // as soon as changes between the form's values and the task are detected save them
        for (const property in changes) {
          if ((this.task as any)[property] !== changes[property]) {
            this.saveTask();
          }
        }
      })
    );

    this.subscription.add(
      this.task$.subscribe(task => {
        if (task === undefined) {
          return;
        }
        this.task = task;
        this.taskForm.patchValue(task);

        // got a new value from the store; signal the changes
        // though these could originate from other sources
        if (this.canRevert$.value) {
          this.changeNotice$.next('... changes saved');
          setTimeout(() => this.changeNotice$.next(''), 1000);
        }
      })
    );
  }

  saveTask(): void {
    // merge data with spread operator
    this.store.dispatch(
      updateTask({ task: { ...this.initialTask, ...this.taskForm.value } })
    );
    this.canRevert$.next(true);
  }

  revertChanges(): void {
    this.store.dispatch(updateTask({ task: this.initialTask }));
    this.canRevert$.next(false);
  }

  deleteTask(): void {
    // the ID of a task won't ever change since inception
    this.ds.deleteTask(this.initialTask.id);

    // tk should check for effective deletion by listening to observable?
    this.dialogRef.close();
  }
}
