import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { Options } from 'sortablejs';
import { NewTasksPositionsDto } from 'src/app/models/dtos/newTaskPositions.dto';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from 'src/app/models/schedule';
import {
  selectLoading,
  selectTasksByDay
} from 'src/app/store/schedule.selectors';
import { take } from 'rxjs/operators';
import { updateTasks, addTask } from 'src/app/store/schedule.actions';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss']
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;
  @ViewChild('addTaskInput') addTaskInput: ElementRef;

  tasks: ReadonlyArray<Task>;
  loading: Observable<boolean> = this.store.pipe(select(selectLoading));
  addingTask$ = new BehaviorSubject<boolean>(false);

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
      group: 'draggable-tasks',
      onRemove: (event: any) => {
        const movedTask = this.tasks[event.oldIndex];

        // watch out for the date's timezone
        const targetDate: Date = new Date(event.to.id);
        let targetTasks: ReadonlyArray<Task> = [];

        // get the target date's sorted tasks
        this.store
          .pipe(
            select(selectTasksByDay, {
              date: targetDate
            }),
            take(1)
          )
          .subscribe(tasks => {
            targetTasks = tasks;
          });

        // pick the ID above the moved task
        const antecedentId =
          targetTasks.length === 0 || event.newIndex === 0
            ? null
            : targetTasks[event.newIndex - 1].id;

        const updatedTasks = [movedTask.toDto()];

        // change the task that references the one being changed
        const orphanTask = this.tasks
          .find(task => task.previousId === movedTask.id)
          ?.toDto();
        if (orphanTask) {
          orphanTask.previousId = movedTask.previousId;
          updatedTasks.push(orphanTask);
        }

        // replace the task whose previous ID matches the new reference
        const pushedDown = targetTasks
          .find(task => task.previousId === antecedentId)
          ?.toDto();
        if (pushedDown) {
          pushedDown.previousId = movedTask.id;
          updatedTasks.push(pushedDown);
        }

        // finally change the moved task
        updatedTasks[0].date = targetDate;
        updatedTasks[0].previousId = antecedentId;

        // dispatch the effect
        this.store.dispatch(
          updateTasks({
            tasksDtos: updatedTasks
          })
        );
      },
      onUpdate: (event: any) => {
        this.changeTaskPositions(event.oldIndex, event.newIndex);
      }
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  promptAddTask(): void {
    this.addingTask$.next(true);
    setTimeout(() => {
      this.addTaskInput.nativeElement.focus();
    }, 0);
  }

  leavePromptAddTask(): void {
    const title = this.newTaskControl.value;
    this.cancelPromptAddTask();
    if (title) {
      this.addTask(title);
    }
  }

  cancelPromptAddTask(): void {
    this.newTaskControl.reset();
    this.addingTask$.next(false);
  }

  addTask(title: string): void {
    // check whether this is the first task
    const previousId =
      this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id : null;

    this.store.dispatch(
      addTask({
        task: {
          title,
          previousId,
          date: this.date,
          details: null,
          complete: false,
          duration: null
        }
      })
    );
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

      // tk can actually skip iteration above once found with 'continue'

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

  get dayUrl(): string {
    return this.ds.getUrl(this.date);
  }
}
