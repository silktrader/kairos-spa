import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Subscription, Observable } from 'rxjs';
import { Options } from 'sortablejs';
import { NewTasksPositionsDto } from 'src/app/models/dtos/newTaskPositions.dto';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from 'src/app/models/schedule';
import { selectLoading } from 'src/app/store/schedule.selectors';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;

  tasks: ReadonlyArray<Task>;
  loading: Observable<boolean> = this.store.pipe(select(selectLoading));

  private subscriptions = new Subscription();

  newTaskControl = new FormControl('');

  options: Options;

  constructor(
    private readonly store: Store<ScheduleState>,
    private readonly ds: DayService,
    private editTaskDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.ds.getDayTasks(this.date).subscribe(tasks => {
        this.tasks = tasks;
      })
    );

    this.options = {
      group: 'normal-group',
      onAdd: (event: any) => {
        console.log(event);
      },
      onRemove: (event: any) => {
        console.log(event);
      },
      onUpdate: (event: any) => {
        this.changeTaskPositions(event.oldIndex, event.newIndex);
      }
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  addTask(title: string): void {
    // check whether this is the first task
    const previousId =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id : null;

    // tk use the store
    this.ds.addTask({
      id: 0, // tk diff between get and post dto,
      previousId,
      date: this.date,
      title,
      details: null,
      complete: false,
      duration: null
    });
    this.newTaskControl.reset();
  }

  private changeTaskPositions(oldIndex: number, newIndex: number): void {
    let newPositions;

    if (oldIndex > newIndex) {
      // going upwards, so decreasing indices
      newPositions = this.calcNewTaskPositions(
        this.tasks[oldIndex],
        this.tasks[newIndex].previousId
      );
    } else {
      // going downwards
      newPositions = this.calcNewTaskPositions(
        this.tasks[oldIndex],
        this.tasks[newIndex].id
      );
    }

    this.ds.updateTaskPositions(newPositions);
  }

  private calcNewTaskPositions(
    movingTask: Task,
    newPreviousId: number | null
  ): NewTasksPositionsDto {
    const changedTaskPositions = [
      { taskId: movingTask.id, previousId: newPreviousId }
    ];

    // browse the tasks and mark those whose previous IDs need to be changed
    for (const task of this.tasks) {
      // change the task that referenced the moving task
      if (task.previousId === movingTask.id) {
        changedTaskPositions.push({
          taskId: task.id,
          previousId: movingTask.previousId
        });
      }

      // change the task that referenced the one on top of the moving task
      if (task.previousId === newPreviousId) {
        changedTaskPositions.push({
          taskId: task.id,
          previousId: movingTask.id
        });
      }
    }

    return { tasks: changedTaskPositions };
  }

  public openEditTakDialog(task: Task) {
    this.editTaskDialog.open(EditTaskDialogComponent, {
      data: task,
      panelClass: 'kairos-edit-task-dialog'
    });
  }

  get isToday(): boolean {
    return this.ds.isToday(this.date);
  }

  get dayName(): string {
    return this.ds.getDayName(this.date);
  }

  get daySubtitle(): string {
    return this.ds.getDaySubtitle(this.date);
  }
}
