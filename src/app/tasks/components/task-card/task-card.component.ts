import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Task } from '../../models/task';
import { MatDialog } from '@angular/material/dialog';
import { EditTaskDialogComponent } from '../edit-task-dialog/edit-task-dialog.component';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/store/app-state';
import { selectTagColour, selectTaskTimer } from '../../state/tasks.selectors';
import { map } from 'rxjs/operators';
import { timer, combineLatest, Subject, Observable } from 'rxjs';
import { parseISO, differenceInMinutes } from 'date-fns';
import { TaskTimer } from '../../models/task-timer.dto';

@Component({
  selector: 'app-task-card',
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardComponent implements OnInit {
  @Input() task: Task;

  // must assign it after input's received
  public timer$: Observable<TaskTimer | undefined>;
  public timerValue$: Observable<number | undefined>;

  constructor(
    private editTaskDialog: MatDialog,
    private readonly store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.timer$ = this.store.select(selectTaskTimer, {
      taskId: this.task.id,
    });

    this.timerValue$ = combineLatest([timer(0, 60000), this.timer$]).pipe(
      map(([, taskTimer]) => {
        console.log('called');
        return taskTimer
          ? differenceInMinutes(Date.now(), parseISO(taskTimer.timestamp))
          : undefined;
      })
    );
  }

  public openEditTaskDialog(task: Task) {
    this.editTaskDialog.open(EditTaskDialogComponent, {
      data: task,
      panelClass: 'kairos-dialog',
    });
  }

  badgeCss$(badgeNumber: number, tagName: string) {
    return this.store.select(selectTagColour, { tagName }).pipe(
      map((colour) => {
        const left = `${-30 * badgeNumber}px`;
        const bottom = left;
        const height = `${60 * badgeNumber}px`;
        const width = height;
        return {
          backgroundColor: colour,
          height,
          left,
          bottom,
          width,
          zIndex: -1 * badgeNumber, // display badges below task titles
        };
      })
    );
  }
}
