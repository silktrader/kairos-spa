import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TagDto } from '../../models/tag.dto';
import { takeUntil } from 'rxjs/operators';
import { TasksState } from '../../state/tasks.state';
import { Store } from '@ngrx/store';
import { selectAvailableTagColours } from '../../state/tasks.selectors';
import { editTag, editTagSuccess } from '../../state/tasks.actions';
import { Actions, ofType } from '@ngrx/effects';

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
    colour: new FormControl(undefined, [Validators.required]),
  });

  private selectedColour$ = new Subject<string>();
  public selectedColour: string;
  public readonly initialColour: string = this.tag.colour;

  tagUpdating$ = new BehaviorSubject(false);
  readonly unchanged$ = new BehaviorSubject(false);
  readonly ngUnsubscribe$ = new Subject();

  availableTagColours$ = this.store.select(selectAvailableTagColours);

  constructor(
    @Inject(MAT_DIALOG_DATA) public tag: TagDto,
    public dialogRef: MatDialogRef<EditTagDialogComponent>,
    private readonly store: Store<TasksState>,
    private readonly actions$: Actions
  ) {}

  ngOnInit(): void {
    // update the form with the chosen colour, despite the absence of a matching input
    this.selectedColour$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedColour) => {
        this.selectedColour = selectedColour;
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

  selectColour(colour: string): void {
    this.selectedColour$.next(colour);
  }

  resetChanges(): void {
    this.tagForm.patchValue(this.tag);
    this.selectedColour$.next(this.tag.colour);
  }

  saveTag(): void {
    this.store.dispatch(
      editTag({
        tagDto: {
          ...this.tagForm.value,
          id: this.tag.id,
          colour: this.selectedColour,
        },
      })
    );
  }

  deleteTag(): void {}
}
