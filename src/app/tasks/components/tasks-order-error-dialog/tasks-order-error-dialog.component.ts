import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../models/task';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { selectTasksByDate } from '../../state/tasks.selectors';
import { first } from 'rxjs/operators';
import { updateTasks } from '../../state/tasks.actions';
import { TaskService } from '../../task.service';
import { TaskDto } from '../../models/task.dto';

@Component({
  selector: 'app-tasks-order-error-dialog',
  templateUrl: './tasks-order-error-dialog.component.html',
  styleUrls: ['./tasks-order-error-dialog.component.scss'],
})
export class TasksOrderErrorDialogComponent implements OnInit {
  public unorderedTasks: ReadonlyArray<Task>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public date: Date,
    private readonly store: Store<AppState>,
    private readonly ts: TaskService
  ) {}

  ngOnInit(): void {
    // read tasks for the specificed date
    this.store
      .select(selectTasksByDate, { date: this.date })
      .pipe(first())
      .subscribe((tasks) => (this.unorderedTasks = tasks));
  }

  public recover(): void {
    this.store.dispatch(
      updateTasks({
        tasksDtos: this.reorderTasks(this.unorderedTasks),
      })
    );
  }

  private reorderTasks(tasks: ReadonlyArray<Task>): ReadonlyArray<TaskDto> {
    // build a set of DTOs
    const unorderedTasks = new Set<TaskDto>();
    for (const task of tasks) {
      unorderedTasks.add(this.ts.serialise(task));
    }

    const orderedTasks: Array<TaskDto> = [];
    let lastTaskId: number | null = null;

    // the first strategy is to order tasks according to previous IDs
    while (unorderedTasks.size > 0) {
      let foundTask: TaskDto | undefined;
      for (const taskDto of unorderedTasks) {
        if (taskDto.previousId === lastTaskId) {
          orderedTasks.push(taskDto);
          foundTask = taskDto;
          lastTaskId = taskDto.id;
          break;
        }
      }

      if (foundTask) unorderedTasks.delete(foundTask);
      else break;
    }

    // failing to connect the other tasks or any at all, these are ordered according to ID
    if (unorderedTasks.size > 0) {
      const remainingTasks = [...unorderedTasks].sort((a, b) => a.id - b.id);
      for (const task of remainingTasks) {
        orderedTasks.push({
          ...task,
          previousId: orderedTasks[orderedTasks.length - 1].id,
        });
      }
    }

    return orderedTasks;
  }
}
