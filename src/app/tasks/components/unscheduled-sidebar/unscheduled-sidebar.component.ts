import { Component, OnInit } from '@angular/core';
import { Options } from 'sortablejs';
import { Observable, combineLatest } from 'rxjs';
import { TaskDto } from '../../models/task.dto';
import { TasksState } from '../../state/tasks.state';
import { Store, select } from '@ngrx/store';
import {
  selectUnscheduledTasks,
  selectTasksByDate,
  selectTasks,
} from '../../state/tasks.selectors';
import { first, map } from 'rxjs/operators';
import { TaskService } from '../../task.service';
import { updateTasks } from '../../state/tasks.actions';

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

  constructor(
    private readonly store: Store<TasksState>,
    private readonly ts: TaskService
  ) {}

  ngOnInit(): void {
    this.options = {
      group: 'draggableTasks',
      sort: false,
      onRemove: (event) => this.scheduleTask(event),
    };
  }

  private scheduleTask(event: any): void {
    const date: string = event.to.id;
    const scheduledTaskId: number = parseInt(event.item.id, 10);
    this.store.pipe(select(selectTasks), first()).subscribe((allTasks) => {
      // fetch the date tasks and the unscheduled task
      let dateTasks = new Array<TaskDto>();
      let scheduledTask: TaskDto | undefined;
      for (const task of allTasks) {
        if (task.date === date) dateTasks.push(task);
        else if (task.id === scheduledTaskId) scheduledTask = task;
      }

      if (scheduledTask === undefined) {
        console.log(event.item.id);
        return;
      } // tk throw error

      // sort the date tasks
      dateTasks = this.ts.sortTasks(dateTasks) as Array<TaskDto>;

      // pick the ID above the moved task
      const aboveId =
        dateTasks.length === 0 || event.newIndex === 0
          ? null
          : dateTasks[event.newIndex - 1].id;

      const updatedTasks: Array<TaskDto> = [
        { ...scheduledTask, previousId: aboveId, date },
      ];

      const pushedDown = dateTasks.find((task) => task.previousId === aboveId);
      if (pushedDown) {
        updatedTasks.push({ ...pushedDown, previousId: scheduledTask.id });
      }

      this.store.dispatch(
        updateTasks({
          tasks: updatedTasks,
        })
      );
    });
  }
}
