import { Component, OnInit } from '@angular/core';
import { TasksState } from '../../state/tasks.state';
import { Store } from '@ngrx/store';
import { selectTags } from '../../state/tasks.selectors';
import { getTags } from '../../state/tasks.actions';

@Component({
  selector: 'app-tags-sidebar',
  templateUrl: './tags-sidebar.component.html',
  styleUrls: ['./tags-sidebar.component.scss'],
})
export class TagsSidebarComponent implements OnInit {
  readonly tags$ = this.store.select(selectTags);

  constructor(private readonly store: Store<TasksState>) {}

  ngOnInit(): void {
    this.store.dispatch(getTags());
  }

  addTag(): void {}
}
