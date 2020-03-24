import { Injectable } from '@angular/core';
import { Day } from 'src/app/models/day';
import { Task } from '../models/task';
import { addDays, format, isToday } from 'date-fns';
import { Store, select } from '@ngrx/store';
import {
  addTask,
  deleteTask,
  setTasks,
  repositionTasks,
  updateTask
} from '../store/schedule.actions';
import { Schedule } from '../models/schedule';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from '../models/dtos/task.dto';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';
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
    private readonly store: Store<Schedule>
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

  getTasksBetweenDates(startDate: Date, endDate: Date) {
    this.http
      .get<ReadonlyArray<TaskDto>>(
        `${environment.backendRootURL}/schedule/tasks`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        }
      )
      .subscribe({
        next: (tasks: TaskDto[]) => {
          this.store.dispatch(setTasks({ tasks: tasks.map(this.mapTask) }));
        },
        error: () => {
          console.log('Couldnt get dates');
        }
      });
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
  deleteTask(task: Task): void {
    this.http
      .delete<DeleteTaskDto>(
        `${environment.backendRootURL}/schedule/tasks/${task.id}`
      )
      .pipe(
        catchError(error => {
          console.error(error);
          return throwError(`Could not delete task with ID ${task.id}`);
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

  updateTask(task: Task): void {
    this.http
      .put<TaskDto>(
        `${environment.backendRootURL}/schedule/tasks/${task.id}`,
        task
      )
      .pipe(
        catchError(error => {
          console.error(error);
          return throwError(`Could not update task #${task.id}`);
        })
      )
      .subscribe(taskDto => {
        this.store.dispatch(updateTask({ task: this.mapTask(taskDto) }));
      });
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
