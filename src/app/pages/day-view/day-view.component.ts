import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Observable, Subscription } from 'rxjs';
import { Options } from 'sortablejs';
import { NewTasksPositionsDto } from 'src/app/models/dtos/newTaskPositions.dto';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;

  tasks$: Observable<ReadonlyArray<Task>>;
  tasks: ReadonlyArray<Task>;

  private lastTaskId: number;
  private subscriptions = new Subscription();

  newTaskControl = new FormControl('');

  options: Options;

  constructor(private ds: DayService) {}

  ngOnInit(): void {
    this.tasks$ = this.ds.getDayTasks(this.date);
    this.tasks$.subscribe(tasks => {
      this.tasks = tasks;
      this.lastTaskId = tasks[tasks.length - 1]?.id;
    });

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
    this.ds.addTask({
      date: this.date,
      title,
      id: 0, // tk diff between get and post dto,
      previousId: this.lastTaskId
    });
    this.newTaskControl.reset();
  }

  deleteTask(task: Task): void {
    this.ds.deleteTask(task);
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
    newPreviousId: number | undefined
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
