import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Task } from 'src/app/models/task';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription, BehaviorSubject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { take } from 'rxjs/operators';
import { formatISO } from 'date-fns';
import {
  selectTaskEditingId,
  selectTaskById,
} from 'src/app/tasks/state/tasks.selectors';
import { edit, remove } from 'src/app/tasks/state/tasks.actions';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss'],
})
export class EditTaskDialogComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  private readonly durationControl = new FormControl(undefined, {
    updateOn: 'blur',
  });
  private readonly completeControl = new FormControl(false);

  readonly taskForm = this.formBuilder.group({
    title: [undefined, { updateOn: 'blur' }],
    details: [undefined, { updateOn: 'blur' }],
    date: [undefined, { updateOn: 'blur' }],
    complete: this.completeControl,
    duration: this.durationControl,
  });

  readonly taskUpdating$ = this.store.pipe(select(selectTaskEditingId));

  readonly task$ = this.store.pipe(
    select(selectTaskById, { id: this.initialTask.id })
  );
  readonly changeNotice$ = new BehaviorSubject<string>('');
  readonly canRevert$ = new BehaviorSubject<boolean>(false);

  public task: Task;

  private readonly subscription = new Subscription();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store<AppState>,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.taskForm.valueChanges.subscribe((changes) => {
        // as soon as changes between the form and the task are detected save them
        if (this.task.hasDifferentContents(changes)) this.saveTask();

        // when the original task value and the form's contents differ allow changes to be reverted
        this.canRevert$.next(this.initialTask.hasDifferentContents(changes));
      })
    );

    this.subscription.add(
      this.task$.subscribe((task) => {
        if (task === undefined) {
          return;
        }
        this.task = task;

        // the backend can perform changes depending on values sent
        this.taskForm.patchValue(task);

        // duration is set to null when tasks are marked as incomplete
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private saveTask(): void {
    // ensure that the date is set to UTC
    const date = new Date(
      formatISO(this.taskForm.value.date, { representation: 'date' })
    );

    // merge data with spread operator
    this.store.dispatch(
      edit({
        originalTask: {
          ...this.task,
        },
        updatedTask: {
          ...this.initialTask,
          ...this.taskForm.value,
          date,
        },
      })
    );
  }

  revertChanges(): void {
    this.store.dispatch(
      edit({
        updatedTask: this.initialTask,
        originalTask: this.taskForm.value,
      })
    );
  }

  deleteTask(): void {
    this.store.dispatch(remove({ removedTaskId: this.initialTask.id }));

    // tk should check for effective deletion by listening to observable?
    this.dialogRef.close();
  }

  resizeDetailsTextarea() {
    this.ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
}
