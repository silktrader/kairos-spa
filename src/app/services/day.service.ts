import { Injectable } from '@angular/core';
import { Day } from 'src/app/models/day';
import { Task } from '../models/task';
import { addDays, format, isToday } from 'date-fns';
import { Store, select } from '@ngrx/store';
import { ScheduleState } from '../store/schedule';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from '../models/dtos/task.dto';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { selectTasksByDay } from '../store/schedule.selectors';
import { DeleteTaskDto } from '../models/dtos/deleteTask.dto';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class DayService {
  constructor(
    private readonly http: HttpClient,
    private readonly store: Store<ScheduleState>,
    private readonly ns: NotificationService
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
            endDate: endDate.toISOString(),
          },
        }
      )
      .pipe(map((taskDtos) => taskDtos.map(this.mapTask)));
  }

  addTask(taskDto: Omit<TaskDto, 'id'>): Observable<Task> {
    return this.http
      .post<TaskDto>(`${environment.backendRootURL}/schedule/tasks`, taskDto)
      .pipe(
        map(this.mapTask)
        // catchError(error => {
        //   this.ns.alert(error);
        // })
      );
  }

  // might create an adapter service or use class-transformer later tk
  private mapTask(taskDto: TaskDto): Task {
    return new Task(
      taskDto.id,
      taskDto.previousId,
      new Date(taskDto.date),
      taskDto.title,
      taskDto.details,
      taskDto.complete,
      taskDto.duration
    );
  }

  deleteTask(taskId: number): Observable<DeleteTaskDto> {
    return this.http
      .delete<{ deletedTaskId: number; affectedTask: TaskDto | null }>(
        `${environment.backendRootURL}/schedule/tasks/${taskId}`
      )
      .pipe(
        map((response) => {
          return {
            deletedTaskId: response.deletedTaskId,
            affectedTask: response.affectedTask
              ? this.mapTask(response.affectedTask)
              : null,
          };
        })
      );
  }

  updateTask(task: TaskDto): Observable<Task> {
    return this.http
      .put<TaskDto>(
        `${environment.backendRootURL}/schedule/tasks/${task.id}`,
        task
      )
      .pipe(map(this.mapTask));
  }

  updateTasks(tasks: ReadonlyArray<TaskDto>): Observable<ReadonlyArray<Task>> {
    return this.http
      .put<ReadonlyArray<TaskDto>>(
        `${environment.backendRootURL}/schedule/tasks/`,
        tasks
      )
      .pipe(map((tasksDtos) => tasksDtos.map(this.mapTask)));
  }
}
