import { Component, OnInit } from '@angular/core';
import { TasksState } from '../../tasks/state/tasks.state';
import { Store } from '@ngrx/store';
import { selectTags } from '../../tasks/state/tasks.selectors';
import { getTags } from '../../tasks/state/tasks.actions';
import { MatDialog } from '@angular/material/dialog';
import { EditTagDialogComponent } from '../../tasks/components/edit-tag-dialog/edit-tag-dialog.component';
import { TagDto } from '../../tasks/models/tag.dto';

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

  addTag(): void {
    this.dialog.open(EditTagDialogComponent, {
      panelClass: 'kairos-dialog',
      data: undefined,
    });
  }

  editTag(tag: TagDto): void {
    this.dialog.open(EditTagDialogComponent, {
      panelClass: 'kairos-dialog',
      data: tag,
    });
  }
}
