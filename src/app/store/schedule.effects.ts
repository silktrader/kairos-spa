import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DayService } from '../services/day.service';
import * as ScheduleActions from './schedule.actions';
import { mergeMap, map, catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { Task } from '../models/task';
import { TaskDto } from '../models/dtos/task.dto';

@Injectable()
export class ScheduleEffects {
  getTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.getDatesTasks),
      mergeMap((action: { startDate: Date; endDate: Date }) =>
        this.ds.getTasksBetweenDates(action.startDate, action.endDate).pipe(
          map(tasks => ScheduleActions.getDatesTasksSuccess({ tasks })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.updateTask),
      mergeMap((action: { task: Task }) =>
        this.ds
          .updateTask(action.task)
          .pipe(map(task => ScheduleActions.updateTaskSuccess({ task })))
      )
    )
  );

  updateTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ScheduleActions.updateTasks),
      mergeMap((action: { tasksDtos: ReadonlyArray<TaskDto> }) =>
        this.ds
          .updateTasks(action.tasksDtos)
          .pipe(map(tasks => ScheduleActions.updateTasksSuccess({ tasks })))
      )
    )
  );

  constructor(private actions$: Actions, private ds: DayService) {}
}
