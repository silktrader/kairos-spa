import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TaskService } from 'src/app/tasks/task.service';
import * as TasksActions from './tasks.actions';
import {
  mergeMap,
  map,
  catchError,
  first,
  withLatestFrom,
  tap,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { TaskDto } from 'src/app/tasks/models/task.dto';
import { MatDialog } from '@angular/material/dialog';
import { TagDto } from '../models/tag.dto';
import { TaskTimer } from '../models/task-timer.dto';
import { AppState } from 'src/app/store/app-state';
import { Store, select } from '@ngrx/store';
import { selectTags } from './tasks.selectors';
import { TasksErrorDialogComponent } from '../components/tasks-error-dialog/tasks-error-dialog.component';

@Injectable()
export class TasksEffects {
  get$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.get),
      mergeMap((action: { dates: Array<string> }) =>
        this.ts.getTasksFromDates(action.dates).pipe(
          map((tasks) => TasksActions.getSuccess({ tasks })),
          catchError(() => of(TasksActions.getFailed({ dates: action.dates })))
        )
      )
    )
  );

  getFailed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(TasksActions.getFailed),
        tap(() => {
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
        this.ts
          .addTask(action.task)
          .pipe(map((task) => TasksActions.addSuccess({ task })))
      )
    )
  );

  addSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.addSuccess),
      withLatestFrom(this.store.pipe(select(selectTags), first())),
      map(([props, tags]) => {
        const existingTags = tags.map((tag) => tag.name);
        for (const tag of props.task.tags) {
          if (!existingTags.includes(tag)) {
            return TasksActions.getTags();
          }
        }
        return { type: 'none' };
        // return EMPTY
      })
    )
  );

  editSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.editSuccess),
      withLatestFrom(this.store.pipe(select(selectTags), first())),
      map(([props, tags]) => {
        const existingTags = tags.map((tag) => tag.name);
        for (const tag of props.updatedTask.tags) {
          if (!existingTags.includes(tag)) {
            return TasksActions.getTags();
          }
        }
        return { type: 'none' };
      })
    )
  );

  edit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.edit),
      mergeMap((action: { originalTask: TaskDto; updatedTask: TaskDto }) =>
        this.ts.updateTask(action.updatedTask).pipe(
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
        this.ts.deleteTask(action.removedTaskId).pipe(
          map((response) =>
            TasksActions.removeSuccess({
              removedTaskId: action.removedTaskId,
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
        this.ts
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
        this.ts.getTags().pipe(
          map((tags) => TasksActions.getTagsSuccess({ tags })),
          catchError(() => of(TasksActions.getTagsFailure()))
        )
      )
    )
  );

  addTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.addTag),
      mergeMap((action: { tagDto: Omit<TagDto, 'id'> }) =>
        this.ts
          .addTag(action.tagDto)
          .pipe(map((tagDto) => TasksActions.addTagSuccess({ tagDto })))
      )
    )
  );

  editTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.editTag),
      mergeMap((action: { tagDto: TagDto }) =>
        this.ts
          .editTag(action.tagDto)
          .pipe(map((tagDto) => TasksActions.editTagSuccess({ tagDto })))
      )
    )
  );

  deleteTag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.deleteTag),
      mergeMap((action: { tagDto: TagDto }) =>
        this.ts
          .deleteTag(action.tagDto)
          .pipe(
            map(() => TasksActions.deleteTagSuccess({ tagDto: action.tagDto }))
          )
      )
    )
  );

  /* Timers */
  getTimers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.getTimers),
      mergeMap(() =>
        this.ts
          .getTimers()
          .pipe(map((timers) => TasksActions.getTimersSuccess({ timers })))
      )
    )
  );

  addTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.addTimer),
      mergeMap((action: { taskTimer: TaskTimer }) =>
        this.ts
          .addTimer(action.taskTimer)
          .pipe(map((taskTimer) => TasksActions.addTimerSuccess({ taskTimer })))
      )
    )
  );

  stopTimer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TasksActions.stopTimer),
      mergeMap((action: { taskId: number }) =>
        this.ts
          .stopTimer(action.taskId)
          .pipe(
            map(() => TasksActions.stopTimerSuccess({ taskId: action.taskId }))
          )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private ts: TaskService,
    private matDialog: MatDialog,
    private readonly store: Store<AppState>
  ) {}
}
