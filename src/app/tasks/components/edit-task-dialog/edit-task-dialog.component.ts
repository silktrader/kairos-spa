import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  NgZone,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Task } from 'src/app/tasks/models/task';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import {
  takeUntil,
  first,
  startWith,
  map,
  sampleTime,
  throttleTime,
} from 'rxjs/operators';
import { formatISO } from 'date-fns';
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
import { formatDistanceStrict } from 'date-fns';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss'],
})
export class EditTaskDialogComponent implements OnInit, OnDestroy {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('tagsInput') tagsInput: ElementRef<HTMLInputElement>;

  private readonly durationControl = new FormControl(undefined);
  private readonly completeControl = new FormControl(false);
  public readonly tagsControl = new FormControl(undefined);

  readonly taskForm = this.formBuilder.group({
    title: [undefined],
    details: [undefined],
    date: [undefined],
    complete: this.completeControl,
    duration: this.durationControl,
  });

  readonly taskUpdating$ = this.store.select(selectTaskEditingId);
  readonly timer$ = this.store
    .select(selectTaskTimer, {
      taskId: this.initialTask.id,
    })
    .pipe(
      throttleTime(1000),
      map((timer) =>
        timer
          ? formatDistanceStrict(new Date(timer.timestamp), Date.now(), {
              unit: 'minute',
            })
          : ''
      )
    );

  readonly canSave$ = new BehaviorSubject<boolean>(false);

  readonly autoCompletableTags: Observable<
    string[]
  > = this.tagsControl.valueChanges.pipe(
    startWith(null),
    map((tag: string | null) =>
      tag ? this.filterTag(tag) : [...this.existingTags]
    )
  );

  // tk remove below?
  existingTags: Array<string>;
  editedTags$ = new BehaviorSubject<Array<string>>(this.initialTask.tags);
  readonly tagSeparators: number[] = [ENTER, COMMA];

  private ngUnsubscribe$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store<AppState>,
    private readonly actions$: Actions,
    private readonly ngZone: NgZone,
    private readonly ts: TaskService
  ) {}

  ngOnInit(): void {
    this.store
      .select(selectTags)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((tags) => (this.existingTags = tags.map((tag) => tag.name)));

    // when the original task value and the form's contents differ allow changes to be reverted
    combineLatest([this.taskForm.valueChanges, this.editedTags$])
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.canSave$.next(
          this.ts.haveDifferentValues(this.initialTask, this.updatedTask)
        );
      });

    // close the dialog when the task is saved or deleted
    this.actions$
      .pipe(ofType(editSuccess, removeSuccess), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => this.dialogRef.close());

    this.resetChanges();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  get updatedTask(): TaskDto {
    // ensure that the date is set to UTC
    const date = formatISO(this.taskForm.value.date, {
      representation: 'date',
    });
    return {
      id: this.initialTask.id, // ensures the ID is present
      previousId: this.initialTask.previousId,
      ...this.taskForm.value,
      date,
      tags: this.editedTags$.value,
    };
  }

  saveTask(): void {
    // merge data with spread operator
    this.store.dispatch(
      edit({
        originalTask: this.ts.serialise(this.initialTask),
        updatedTask: this.updatedTask,
      })
    );
  }

  resetChanges(): void {
    this.taskForm.patchValue(this.initialTask);
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

    return this.editedTags$.value.filter(
      (tag) => tag.toLowerCase().indexOf(filterValue) === 0
    );
  }

  public startTimer(): void {
    const timestamp = Date.now();
    console.log(timestamp);
    this.store.dispatch(
      addTimer({ taskTimer: { taskId: this.initialTask.id, timestamp } })
    );
  }

  public endTimer(): void {
    this.store.dispatch(stopTimer({ taskId: this.initialTask.id }));
  }
}
