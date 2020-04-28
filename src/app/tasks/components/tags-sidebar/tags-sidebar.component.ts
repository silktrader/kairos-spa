import { Component, OnInit } from '@angular/core';
import { TasksState } from '../../state/tasks.state';
import { Store } from '@ngrx/store';
import { selectTags } from '../../state/tasks.selectors';
import { getTags } from '../../state/tasks.actions';
import { MatDialog } from '@angular/material/dialog';
import { EditTagDialogComponent } from '../edit-tag-dialog/edit-tag-dialog.component';
import { TagDto } from '../../models/tag.dto';

@Component({
  selector: 'app-tags-sidebar',
  templateUrl: './tags-sidebar.component.html',
  styleUrls: ['./tags-sidebar.component.scss'],
})
export class TagsSidebarComponent implements OnInit {
  readonly tags$ = this.store.select(selectTags);

  constructor(
    private readonly store: Store<TasksState>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(getTags());
  }

  addTag(): void {}

  editTag(tag: TagDto): void {
    this.dialog.open(EditTagDialogComponent, {
      panelClass: 'kairos-dialog',
      data: tag,
    });
  }
}
