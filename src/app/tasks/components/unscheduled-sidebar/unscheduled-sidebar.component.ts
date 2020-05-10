import { Component, OnInit } from '@angular/core';
import { Options } from 'sortablejs';
import { Observable } from 'rxjs';
import { TaskDto } from '../../models/task.dto';
import { TasksState } from '../../state/tasks.state';
import { Store } from '@ngrx/store';
import { selectUnscheduledTasks } from '../../state/tasks.selectors';

@Component({
  selector: 'app-unscheduled-sidebar',
  templateUrl: './unscheduled-sidebar.component.html',
  styleUrls: ['./unscheduled-sidebar.component.scss'],
})
export class UnscheduledSidebarComponent implements OnInit {
  options: Options; // SortableJs options

  tasks$: Observable<ReadonlyArray<TaskDto>> = this.store.select(
    selectUnscheduledTasks
  );

  constructor(private readonly store: Store<TasksState>) {}

  ngOnInit(): void {
    this.options = {
      group: 'draggableTasks',
    };
  }
}
