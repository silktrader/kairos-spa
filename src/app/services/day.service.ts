import { Injectable } from '@angular/core';
import { Day } from 'src/app/models/day';
import { Task } from '../models/task';
import { addDays, format, isToday } from 'date-fns';
import { Store, select } from '@ngrx/store';
import {
  addTask,
  deleteTask,
  repositionTasks,
  updateTask
} from '../store/schedule.actions';
import { ScheduleState } from '../models/schedule';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from '../models/dtos/task.dto';
import { environment } from 'src/environments/environment';
import { catchError, map, delay } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { selectTasksByDay } from '../store/schedule.selectors';
import { DeleteTaskDto } from '../models/dtos/deleteTask.dto';
import { NewTasksPositionsDto } from '../models/dtos/newTaskPositions.dto';

@Injectable({
  providedIn: 'root'
})
export class DayService {
  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<ScheduleState>
  ) {}

  getDayName(date: Date): string {
    return format(date, 'cccc');
  }

  getDaySubtitle(date: Date): string {
    return format(date, 'LLLL d');
  }

  isToday(date: Date): boolean {
    return isToday(date);
  }

  getUrl(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  getDay(date: Date): Day {
    return new Day(date, []);
  }

  getDateBefore(date: Date): Date {
    return addDays(date, -1);
  }

  getDateAfter(date: Date): Date {
    return addDays(date, 1);
  }

  getDayTasks(date: Date): Observable<ReadonlyArray<Task>> {
    return this.store.pipe(select(selectTasksByDay, { date }));
  }

  getTasksBetweenDates(
    startDate: Date,
    endDate: Date
  ): Observable<ReadonlyArray<Task>> {
    return this.http
      .get<ReadonlyArray<TaskDto>>(
        `${environment.backendRootURL}/schedule/tasks`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      )
      .pipe(map(taskDtos => taskDtos.map(this.mapTask)));
  }

  addTask(taskDto: TaskDto): void {
    this.http
      .post<TaskDto>(`${environment.backendRootURL}/schedule/tasks`, taskDto)
      .pipe(
        catchError(error => {
          console.log(error);
          return throwError('Couldnt add task');
        })
      )
      .subscribe(response => {
        this.store.dispatch(addTask({ task: this.mapTask(response) }));
      });
  }

  // might create an adapter service or use class-transformer later tk
  private mapTask(taskDto: TaskDto): Task {
    return new Task(
      new Date(taskDto.date),
      taskDto.title,
      taskDto.details ?? '',
      taskDto.id,
      taskDto.previousId
    );
  }

  // tk use delete {date}/tasks/{id}
  deleteTask(taskId: number): void {
    this.http
      .delete<DeleteTaskDto>(
        `${environment.backendRootURL}/schedule/tasks/${taskId}`
      )
      .pipe(
        catchError(error => {
          console.error(error);
          return throwError(`Could not delete task with ID ${taskId}`);
        })
      )
      .subscribe(response => {
        this.store.dispatch(
          deleteTask({
            deletedTaskId: response.deletedTaskId,
            affectedTask: response.affectedTask
              ? this.mapTask(response.affectedTask)
              : null
          })
        );
      });
  }

  updateTask(task: Task): Observable<Task> {
    return this.http
      .put<TaskDto>(
        `${environment.backendRootURL}/schedule/tasks/${task.id}`,
        task
      )
      .pipe(map(this.mapTask));
  }

  updateTaskPositions(newPositions: NewTasksPositionsDto): void {
    this.http
      .patch<ReadonlyArray<TaskDto>>(
        `${environment.backendRootURL}/schedule/tasks/positions`,
        newPositions
      )
      .pipe(
        catchError(error => {
          console.error(error);
          return throwError(error);
        })
      )
      .subscribe(tasks => {
        this.store.dispatch(
          repositionTasks({ tasks: tasks.map(this.mapTask) })
        );
      });
  }
}
