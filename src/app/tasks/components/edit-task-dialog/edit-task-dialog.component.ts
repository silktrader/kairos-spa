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
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { takeUntil, first, startWith, map } from 'rxjs/operators';
import { formatISO } from 'date-fns';
import {
  selectTaskEditingId,
  selectTaskById,
  selectTags,
} from 'src/app/tasks/state/tasks.selectors';
import {
  edit,
  remove,
  editSuccess,
  removeSuccess,
} from 'src/app/tasks/state/tasks.actions';
import { Actions, ofType } from '@ngrx/effects';
import { TagDto } from '../../models/tag.dto';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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

  readonly canSave$ = new BehaviorSubject<boolean>(false);

  readonly autoCompletableTags: Observable<
    string[]
  > = this.tagsControl.valueChanges.pipe(
    startWith(null),
    map((tag: string | null) =>
      tag ? this.filterTag(tag) : [...this.existingTags]
    )
  );
  existingTags: Array<string>;
  tags: Array<string>;
  readonly tagSeparators: number[] = [ENTER, COMMA];

  private ngUnsubscribe$ = new Subject();

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly store: Store<AppState>,
    private readonly actions$: Actions,
    private readonly ngZone: NgZone
  ) {
    this.tags = this.initialTask.tags.map((tag) => tag);
  }

  ngOnInit(): void {
    this.store
      .select(selectTags)
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((tags) => (this.existingTags = tags.map((tag) => tag.name)));

    // when the original task value and the form's contents differ allow changes to be reverted
    this.taskForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((changes) => {
        this.canSave$.next(
          this.initialTask.hasDifferentContents({ ...changes, tags: this.tags })
        ); // tk check whether to include tags as a form control
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

  saveTask(): void {
    // ensure that the date is set to UTC
    const date = new Date(
      formatISO(this.taskForm.value.date, { representation: 'date' })
    );

    // merge data with spread operator
    this.store.dispatch(
      edit({
        originalTask: {
          ...this.initialTask,
        },
        updatedTask: {
          ...this.initialTask,
          ...this.taskForm.value,
          date,
          tags: this.tags,
        },
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
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  addTag(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // add tag
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    // reset the input for new tags to be entered
    if (input) input.value = '';
    this.tagsControl.setValue(null);
  }

  selectTag(event: MatAutocompleteSelectedEvent): void {
    this.tags.push(event.option.viewValue);
    this.tagsInput.nativeElement.value = '';
    this.tagsControl.setValue(null);
  }

  /* Return all those tags which contain the value entered so far */

  private filterTag(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.tags.filter(
      (tag) => tag.toLowerCase().indexOf(filterValue) === 0
    );
  }
}
