import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject, BehaviorSubject } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TagDto } from '../../models/tag.dto';
import { takeUntil } from 'rxjs/operators';

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

  tagUpdating$ = new BehaviorSubject(false);
  canSave$ = new BehaviorSubject(true);
  ngUnsubscribe$ = new Subject();

  availableColours: string[] = [
    '#3e6158',
    '#3f7a89',
    '#96c582',
    '#b7d5c4',
    '#bcd6e7',
    '#7c90c1',
    '#9d8594',
    '#dad0d8',
    '#4b4fce',
    '#4e0a77',
    '#a367b5',
    '#ee3e6d',
    '#d63d62',
    '#c6a670',
    '#f46600',
  ];

  constructor(
    private readonly fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public tag: TagDto
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
