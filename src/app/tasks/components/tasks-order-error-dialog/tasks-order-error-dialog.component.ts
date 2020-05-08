import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { selectTasksByDate } from '../../state/tasks.selectors';
import { first } from 'rxjs/operators';
import { updateTasks } from '../../state/tasks.actions';
import { TaskDto } from '../../models/task.dto';

@Component({
  selector: 'app-tasks-order-error-dialog',
  templateUrl: './tasks-order-error-dialog.component.html',
  styleUrls: ['./tasks-order-error-dialog.component.scss'],
})
export class TasksOrderErrorDialogComponent implements OnInit {
  public unorderedTasks: ReadonlyArray<TaskDto>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public date: string,
    private readonly store: Store<AppState>
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

  private reorderTasks(tasks: ReadonlyArray<TaskDto>): ReadonlyArray<TaskDto> {
    // build a set of DTOs
    const unorderedTasks = new Set<TaskDto>();
    for (const task of tasks) {
      unorderedTasks.add(task);
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
          // the first task referencing null might be missing
          previousId: orderedTasks[orderedTasks.length - 1]?.id ?? null,
        });
      }
    }

    return orderedTasks;
  }
}
