import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  NgZone,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  BehaviorSubject,
  Subject,
  Observable,
  combineLatest,
  timer,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { takeUntil, first, startWith, map, tap } from 'rxjs/operators';
import { formatISO, differenceInMinutes, parseISO } from 'date-fns';
import {
  selectTaskEditingId,
  selectTags,
  selectTaskTimer,
} from 'src/app/tasks/state/tasks.selectors';
import {
  edit,
  remove,
  editSuccess,
  removeSuccess,
  addTimer,
  stopTimer,
} from 'src/app/tasks/state/tasks.actions';
import { Actions, ofType } from '@ngrx/effects';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TaskDto } from '../../models/task.dto';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss'],
})
export class EditTaskDialogComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('tagsInput') tagsInput: ElementRef<HTMLInputElement>;

  private readonly durationControl = new FormControl(undefined, [
    Validators.min(0),
    Validators.max(1440),
  ]);
  public readonly tagsControl = new FormControl(undefined);
  public readonly completed$ = new BehaviorSubject(false);

  readonly taskForm = new FormGroup({
    title: new FormControl(undefined, [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(50),
    ]),
    details: new FormControl(undefined),
    date: new FormControl(undefined, [Validators.required]),
    duration: this.durationControl,
  });

  readonly taskUpdating$ = this.store.select(selectTaskEditingId);
  readonly taskTimer$ = this.store.select(selectTaskTimer, {
    taskId: this.initialTask.id,
  });

  /* Observable emitting the timer's value, in minutes, every minute */
  readonly taskTimerMinutes$ = combineLatest([
    timer(0, 60000),
    this.taskTimer$,
  ]).pipe(
    map(([, taskTimer]) =>
      taskTimer
        ? differenceInMinutes(Date.now(), parseISO(taskTimer.timestamp))
        : undefined
    )
  );

  readonly canSave$ = new BehaviorSubject<boolean>(false);
  readonly disabledTimer$ = new BehaviorSubject<boolean>(
    this.initialTask.complete
  );

  readonly autoCompletableTags: Observable<
    Array<string>
  > = this.tagsControl.valueChanges.pipe(
    startWith(null),
    map((tag: string | null) => (tag ? this.filterTag(tag) : this.existingTags))
  );

  // tk remove below?
  existingTags: Array<string>;
  editedTags$ = new BehaviorSubject<ReadonlyArray<string>>(
    this.initialTask.tags
  );
  readonly tagSeparators: number[] = [ENTER, COMMA];

  private ngUnsubscribe$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: TaskDto,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly store: Store<AppState>,
    private readonly actions$: Actions,
    private readonly ngZone: NgZone,
    private readonly ts: TaskService
  ) {}

  ngOnInit(): void {
    // begin by filling the form with values to avoid undefined dates, etc. in observables
    this.resetChanges();

    this.store
      .select(selectTags)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((tags) => (this.existingTags = tags.map((tag) => tag.name)));

    // when the original task value and the form's contents differ allow changes to be reverted
    combineLatest([
      this.taskForm.valueChanges,
      this.editedTags$,
      this.completed$,
    ])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(
        ([formValue, tags, completed]: [any, Array<string>, boolean]) => {
          this.canSave$.next(
            this.ts.haveDifferentValues(
              this.initialTask,
              this.buildTaskDto(formValue)
            )
          );

          // disable the timer when the task is set as complete
          this.disabledTimer$.next(completed);
        }
      );

    // close the dialog when the task is saved or deleted
    this.actions$
      .pipe(ofType(editSuccess, removeSuccess), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => this.dialogRef.close());

    // disable duration and complete controls when the timer is ongoing
    this.taskTimer$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((taskTimerValue) => {
        taskTimerValue
          ? this.durationControl.disable()
          : this.durationControl.enable();
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  buildTaskDto(formValue: any): TaskDto {
    // ensure that the date is set to UTC
    // the form field might be cleared while editing hence the null check
    // will create a date from either a string or a date object
    const date = formatISO(new Date(formValue.date || Date.now()), {
      representation: 'date',
    });
    return {
      ...this.initialTask, // ensures the ID is present and that duration and complete aren't null
      previousId: this.initialTask.previousId,
      title: formValue.title,
      details: formValue.details,
      complete: this.completed$.value,
      duration: formValue.duration,
      date,
      tags: this.editedTags$.value,
    };
  }

  toggleCompletion(): void {
    this.completed$.next(!this.completed$.value);
  }

  saveTask(): void {
    // merge data with spread operator
    this.store.dispatch(
      edit({
        originalTask: this.initialTask,
        updatedTask: this.buildTaskDto(this.taskForm.value),
      })
    );
  }

  resetChanges(): void {
    this.taskForm.patchValue(this.initialTask);
    this.completed$.next(this.initialTask.complete);
  }

  deleteTask(): void {
    this.store.dispatch(remove({ removedTaskId: this.initialTask.id }));
  }

  resizeDetailsTextarea() {
    this.ngZone.onStable
      .pipe(first(), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  removeTag(tag: string): void {
    this.editedTags$.next([
      ...this.editedTags$.value.filter((item) => item !== tag),
    ]);
  }

  /** Add new tags from the tags text input */
  addTag(event: MatChipInputEvent): void {
    const input = event.input;

    // ensure that tags are always lowercase
    const value = event.value.toLowerCase();

    // add tag
    if ((value || '').trim()) {
      this.editedTags$.next([...this.editedTags$.value, value.trim()]);
    }

    // reset the input for new tags to be entered
    if (input) input.value = '';
    this.tagsControl.setValue(null);
  }

  /** Select tags from the autocomplete menu */
  selectTag(event: MatAutocompleteSelectedEvent): void {
    this.editedTags$.next([...this.editedTags$.value, event.option.viewValue]);
    this.tagsInput.nativeElement.value = '';
    this.tagsControl.setValue(null);
  }

  /** Return all those tags which contain the value entered so far */
  private filterTag(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.existingTags.filter(
      (tag) => tag.toLowerCase().indexOf(filterValue) === 0
    );
  }

  /** Remove partially entered tags, ones that weren't confirmed with delimiters */
  public clearTags(): void {
    this.tagsInput.nativeElement.value = '';
  }

  public startTimer(): void {
    const timestamp = Date.now().toString();
    this.store.dispatch(
      addTimer({ taskTimer: { taskId: this.initialTask.id, timestamp } })
    );
  }

  public endTimer(): void {
    const timerEnd = Date.now();
    this.taskTimer$.pipe(first()).subscribe((taskTimerValue) => {
      if (taskTimerValue) {
        this.durationControl.setValue(
          (parseInt(this.durationControl.value, 10) || 0) +
            differenceInMinutes(timerEnd, parseISO(taskTimerValue.timestamp))
        );
      }
      this.store.dispatch(stopTimer({ taskId: this.initialTask.id }));
    });
  }
}
