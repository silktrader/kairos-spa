import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TagDto, tagConstraints } from '../../models/tag.dto';
import { takeUntil, first } from 'rxjs/operators';
import { TasksState } from '../../state/tasks.state';
import { Store, select } from '@ngrx/store';
import {
  editTag,
  editTagSuccess,
  addTag,
  addTagSuccess,
  deleteTag,
  deleteTagSuccess,
} from '../../state/tasks.actions';
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
    Validators.minLength(tagConstraints.minLength),
    Validators.maxLength(tagConstraints.maxLength),
    Validators.pattern('^[a-z]+$'),
  ]);
  readonly tagForm = new FormGroup({
    title: this.nameControl,
    description: new FormControl(),
    colour: new FormControl(50, [Validators.required]),
  });

  public readonly initialHue = this.tag ? this.tag.colour : this.getRandomHue();
  public readonly selectedHue$ = new BehaviorSubject<number>(this.initialHue);

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
    // detect changes to enable or disable buttons
    this.tagForm.valueChanges
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe(() => {
        this.unchanged$.next(!this.hasChanged);
      });

    // close the dialog when the task is saved or deleted
    this.actions$
      .pipe(
        ofType(editTagSuccess, addTagSuccess, deleteTagSuccess),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe(() => this.dialogRef.close());

    this.resetChanges();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
    this.ngUnsubscribe$.complete();
  }

  private getRandomHue(): number {
    let randomColour = 0;
    this.store
      .pipe(select(selectTagColoursList), first())
      .subscribe((colours) => {
        if (colours.length > 0) randomColour = colours[0];
      });
    return randomColour;
  }

  private get hasChanged(): boolean {
    //if (this.selectedHue$.value !== this.initialHue) return true;

    if (!this.tag) return this.tagForm.dirty;

    const { title, description, colour } = this.tagForm.value;
    if (this.tag.title !== title) return true;
    if (this.tag.description !== description) return true;
    if (this.tag.colour !== colour) return true; // tk, todo there must be a terser synthax for the block above
    return false;
  }

  selectHue(hue: number): void {
    this.selectedHue$.next(hue);
    this.unchanged$.next(!this.hasChanged);
  }

  resetChanges(): void {
    this.tagForm.patchValue(
      this.tag ?? { name: undefined, description: undefined, colour: 50 } // tk, todo: add random colour
    );
    this.selectedHue$.next(this.initialHue);
  }

  saveTag(): void {
    if (this.tag) {
      this.store.dispatch(
        editTag({
          tagDto: {
            ...this.tagForm.value,
            id: this.tag.id,
            //colour: this.selectedHue$.value,
          },
        })
      );
    } else {
      this.store.dispatch(
        addTag({
          tagDto: {
            ...this.tagForm.value,
            //colour: this.selectedHue$.value,
          },
        })
      );
    }
  }

  deleteTag(): void {
    if (this.tag) this.store.dispatch(deleteTag({ tagDto: this.tag }));
  }
}
