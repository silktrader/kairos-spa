import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DayService } from 'src/app/services/day.service';
import { Task } from 'src/app/models/task';
import {
  Subscription,
  Observable,
  BehaviorSubject,
  throwError,
  combineLatest,
  of,
} from 'rxjs';
import { Options } from 'sortablejs';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import {
  selectLoading,
  selectTasksByDay,
  selectHabits,
  selectHabitsEntries,
} from 'src/app/store/schedule.selectors';
import { take, map } from 'rxjs/operators';
import {
  updateTasks,
  addTask,
  addHabitEntry,
  deleteHabitEntry,
} from 'src/app/store/schedule.actions';
import { HabitEntryDto } from 'src/app/models/dtos/habit-entry.dto';
import { HabitDto, HabitDetails } from 'src/app/models/dtos/habit.dto';

@Component({
  selector: 'app-day-view',
  templateUrl: './day-view.component.html',
  styleUrls: ['./day-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayViewComponent implements OnInit, OnDestroy {
  @Input() date: Date;
  @ViewChild('addTaskInput') addTaskInput: ElementRef;

  tasks: ReadonlyArray<Task>;
  loading: Observable<boolean> = this.store.pipe(select(selectLoading));
  addingTask$ = new BehaviorSubject<boolean>(false);
  habitsDetails$: Observable<ReadonlyArray<HabitDetails>>;

  private subscriptions = new Subscription();

  newTaskControl = new FormControl('');

  options: Options; // SortableJs options

  constructor(
    private readonly store: Store<AppState>,
    private readonly ds: DayService,
    private editTaskDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .pipe(select(selectTasksByDay, { date: this.date }))
        .subscribe((tasks) => {
          this.tasks = tasks;
        })
    );

    this.habitsDetails$ = combineLatest([
      this.store.pipe(select(selectHabits)),
      this.store.pipe(select(selectHabitsEntries, { date: this.date })),
    ]).pipe(
      map(([habits, entries]) => {
        const habitsDetails: Array<HabitDetails> = [];
        for (const habit of habits) {
          habitsDetails.push({
            ...habit,
            entry: entries.find((item) => item.habitId === habit.id),
          });
        }
        return habitsDetails;
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
              date: targetDate,
            }),
            take(1)
          )
          .subscribe((tasks) => {
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
          .find((task) => task.previousId === movedTask.id)
          ?.toDto();
        if (orphanTask) {
          orphanTask.previousId = movedTask.previousId;
          updatedTasks.push(orphanTask);
        }

        // replace the task whose previous ID matches the new reference
        const pushedDown = targetTasks
          .find((task) => task.previousId === antecedentId)
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
            tasksDtos: updatedTasks,
          })
        );
      },
      onUpdate: (event: any) => {
        this.changeTaskPosition(event.oldIndex, event.newIndex);
      },
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
          duration: null,
        },
      })
    );
  }

  private changeTaskPosition(oldIndex: number, newIndex: number): void {
    // the original task being moved around
    const mainTask = this.tasks[oldIndex];

    // when moving down assign the [newIndex].id, when moving up assing the [newIndex - 1].id
    const updatedMainTask = {
      ...mainTask.toDto(),
      previousId:
        oldIndex < newIndex
          ? this.tasks[newIndex].id
          : newIndex === 0
          ? null
          : this.tasks[newIndex - 1].id,
    };

    // initialise the list of updated tasks with new positions
    const updatedTasks = [updatedMainTask];

    // browse the tasks and mark those whose previous ID needs to be changed
    for (const task of this.tasks) {
      // change the task that referenced the moved task
      if (task.previousId === mainTask.id) {
        updatedTasks.push({ ...task.toDto(), previousId: mainTask.previousId });
        continue;
      }

      // change the task that referenced the one on top of the moving task
      if (task.previousId === updatedMainTask.previousId) {
        updatedTasks.push({ ...task.toDto(), previousId: mainTask.id });
      }
    }

    this.store.dispatch(
      updateTasks({
        tasksDtos: updatedTasks,
      })
    );
  }

  public openEditTakDialog(task: Task) {
    this.editTaskDialog.open(EditTaskDialogComponent, {
      data: task,
      panelClass: 'kairos-edit-task-dialog',
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

  toggleHabit(habitId: number, habitEntry: HabitEntryDto): void {
    if (habitEntry) {
      this.store.dispatch(
        deleteHabitEntry({
          habitEntry,
        })
      );
    } else {
      this.store.dispatch(
        addHabitEntry({ habitEntry: { date: this.date, habitId, comment: '' } })
      );
    }
  }
}
