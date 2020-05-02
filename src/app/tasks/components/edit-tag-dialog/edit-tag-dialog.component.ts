import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TagDto } from '../../models/tag.dto';
import { takeUntil, first } from 'rxjs/operators';
import { TasksState } from '../../state/tasks.state';
import { Store, select } from '@ngrx/store';
import { editTag, editTagSuccess, addTag } from '../../state/tasks.actions';
import { Actions, ofType } from '@ngrx/effects';
import { selectTagColoursList } from '../../state/tasks.selectors';

@Component({
  selector: 'app-edit-tag-dialog',
  templateUrl: './edit-tag-dialog.component.html',
  styleUrls: ['./edit-tag-dialog.component.scss'],
})
export class EditTagDialogComponent implements OnInit, OnDestroy {
  readonly nameControl = new FormControl(undefined, [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(12),
    Validators.pattern('^[a-z]+$'),
  ]);
  readonly tagForm = new FormGroup({
    name: this.nameControl,
    description: new FormControl(),
  });

  public readonly initialColour = this.tag
    ? this.tag.colour
    : this.getRandomColour();
  public readonly selectedColour$ = new BehaviorSubject<string>(
    this.initialColour
  );

  tagUpdating$ = new BehaviorSubject(false);
  readonly unchanged$ = new BehaviorSubject(false);
  readonly ngUnsubscribe$ = new Subject();

  tagColoursList$ = this.store.select(selectTagColoursList);

  constructor(
    @Inject(MAT_DIALOG_DATA) public tag: TagDto | undefined,
    public dialogRef: MatDialogRef<EditTagDialogComponent>,
    private readonly store: Store<TasksState>,
    private readonly actions$: Actions
  ) {}

  ngOnInit(): void {
    // update the form with the chosen colour, despite the absence of a matching input
    this.selectedColour$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedColour) => {
        this.tagForm.patchValue({ colour: selectedColour });
      });

    // close the dialog when the task is saved or deleted
    this.actions$
      .pipe(ofType(editTagSuccess), takeUntil(this.ngUnsubscribe$))
      .subscribe(() => this.dialogRef.close());

    this.resetChanges();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private getRandomColour(): string {
    let randomColour = '#fff';
    this.store
      .pipe(select(selectTagColoursList), first())
      .subscribe((colours) => {
        if (colours.length > 0) randomColour = colours[0];
      });
    return randomColour;
  }

  selectColour(colour: string): void {
    this.selectedColour$.next(colour);
  }

  resetChanges(): void {
    this.tagForm.patchValue(
      this.tag ?? { name: undefined, description: undefined }
    );
    this.selectedColour$.next(this.initialColour);
  }

  saveTag(): void {
    if (this.tag) {
      this.store.dispatch(
        editTag({
          tagDto: {
            ...this.tagForm.value,
            id: this.tag.id,
            colour: this.selectedColour$.value,
          },
        })
      );
    } else {
      this.store.dispatch(
        addTag({
          tagDto: {
            ...this.tagForm.value,
            colour: this.selectedColour$.value,
          },
        })
      );
    }
  }

  deleteTag(): void {}
}
