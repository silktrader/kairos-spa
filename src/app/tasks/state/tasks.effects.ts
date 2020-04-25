import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { DayService } from 'src/app/services/day.service';
import * as TasksActions from './tasks.actions';
import { mergeMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { TasksErrorDialogComponent } from 'src/app/core/components/error-dialog/tasks-error-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TagDto } from '../models/tag.dto';
import { EditTaskDialogComponent } from '../components/edit-task-dialog/edit-task-dialog.component';

@Injectable()
export class TasksEffects {
  get$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.get),
      mergeMap((action: { startDate: Date; endDate: Date }) =>
        this.ds.getTasksBetweenDates(action.startDate, action.endDate).pipe(
          map((tasks) => TasksActions.getSuccess({ tasks })),
          catchError((error) => of(TasksActions.getFailed({ error })))
        )
      )
    )
  );

  getSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TasksActions.getSuccess),
        tap(() => {
          // close error dialogs when present
          this.matDialog.closeAll();
        })
      ),
    { dispatch: false }
  );

  getFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TasksActions.getFailed),
        tap(() => {
          this.matDialog.closeAll(); // avoid the stacking of errors dialogs when retrying
          this.matDialog.open(TasksErrorDialogComponent, {
            panelClass: 'kairos-dialog',
            disableClose: true,
          });
        })
      ),
    { dispatch: false }
  );

  add$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.add),
      mergeMap((action: { task: Omit<TaskDto, 'id'> }) =>
        this.ds
          .addTask(action.task)
          .pipe(map((task) => TasksActions.addSuccess({ task })))
      )
    )
  );

  edit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.edit),
      mergeMap((action: { originalTask: TaskDto; updatedTask: TaskDto }) =>
        this.ds.updateTask(action.updatedTask).pipe(
          map((task) =>
            TasksActions.editSuccess({
              originalTask: action.originalTask,
              updatedTask: task,
            })
          )
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.remove),
      mergeMap((action: { removedTaskId: number }) =>
        this.ds.deleteTask(action.removedTaskId).pipe(
          map((response) =>
            TasksActions.removeSuccess({
              removedTaskId: response.deletedTaskId,
              affectedTask: response.affectedTask,
            })
          )
        )
      )
    )
  );

  updateTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.updateTasks),
      mergeMap((action: { tasksDtos: ReadonlyArray<TaskDto> }) =>
        this.ds
          .updateTasks(action.tasksDtos)
          .pipe(map((tasks) => TasksActions.updateTasksSuccess({ tasks })))
      )
    )
  );

  /* Tags */
  getTags$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.getTags),
      mergeMap(() =>
        this.ds.getTags().pipe(
          map((tags) => TasksActions.getTagsSuccess({ tags })),
          catchError(() => of(TasksActions.getTagsFailure()))
        )
      )
    )
  );

  addTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.addTag),
      mergeMap(() =>
        this.ds.addTag().pipe(map((tag) => TasksActions.addTagSuccess({ tag })))
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ds: DayService,
    private matDialog: MatDialog
  ) {}
}
