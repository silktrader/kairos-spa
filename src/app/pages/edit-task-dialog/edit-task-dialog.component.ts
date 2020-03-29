import { Component, OnInit, Inject, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
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
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  private readonly durationControl = new FormControl(undefined, {
    updateOn: 'blur'
  });
  private readonly completeControl = new FormControl(false);

  readonly taskForm = this.formBuilder.group({
    title: [undefined, { updateOn: 'blur' }],
    details: [undefined, { updateOn: 'blur' }],
    date: [undefined, { updateOn: 'blur' }],
    complete: this.completeControl,
    duration: this.durationControl
  });

  readonly taskUpdating$ = this.store.pipe(
    select(selectTaskUpdating, { id: this.initialTask.id })
  );

  readonly task$ = this.store.pipe(
    select(selectTaskById, { id: this.initialTask.id })
  );
  readonly changeNotice$ = new BehaviorSubject<string>('');
  readonly canRevert$ = new BehaviorSubject<boolean>(false);

  private task: Task;

  private readonly subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly ds: DayService,
    private readonly store: Store<ScheduleState>,
    private readonly ngZone: NgZone
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

        // the backend can perform changes depending on values sent
        // duration is set to null when tasks are marked as incomplete
        this.taskForm.patchValue(task);

        if (this.task.complete) {
          this.durationControl.enable();
        } else {
          this.durationControl.disable();
        }

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

  resizeDetailsTextarea() {
    this.ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
