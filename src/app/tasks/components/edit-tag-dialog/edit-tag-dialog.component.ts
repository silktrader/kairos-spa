import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagDto } from '../../models/tag.dto';
import { takeUntil } from 'rxjs/operators';
import { TasksState } from '../../state/tasks.state';
import { Store } from '@ngrx/store';
import { selectAvailableTagColours } from '../../state/tasks.selectors';

@Component({
  selector: 'app-edit-tag-dialog',
  templateUrl: './edit-tag-dialog.component.html',
  styleUrls: ['./edit-tag-dialog.component.scss'],
})
export class EditTagDialogComponent implements OnInit, OnDestroy {
  readonly tagForm = this.fb.group({
    name: [undefined],
    description: [undefined],
    colour: [undefined],
  });

  private selectedColour$ = new Subject<string>();
  public selectedColour: string;
  public readonly initialColour: string = this.tag.colour;

  tagUpdating$ = new BehaviorSubject(false);
  canSave$ = new BehaviorSubject(true);
  ngUnsubscribe$ = new Subject();

  availableTagColours$ = this.store.select(selectAvailableTagColours);

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public tag: TagDto,
    private readonly store: Store<TasksState>
  ) {}

  ngOnInit(): void {
    this.selectedColour$
      .pipe(takeUntil(this.ngUnsubscribe$))
      .subscribe((selectedColour) => {
        this.selectedColour = selectedColour;
        this.tagForm.patchValue({ colour: selectedColour });
      });
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
    console.log({ ...this.tagForm.value, colour: this.selectedColour });
  }

  deleteTag(): void {}
}
