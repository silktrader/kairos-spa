import { Injectable } from '@angular/core';
import { Task } from '../tasks/models/task';
import { format } from 'date-fns';
import { HttpClient } from '@angular/common/http';
import { TaskDto } from '../tasks/models/task.dto';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DeleteTaskDto } from '../tasks/models/deleteTask.dto';
import { TagDto } from '../tasks/models/tag.dto';

@Injectable({
  providedIn: 'root',
})
export class DayService {
  private readonly tasksUrl = `${environment.backendRootURL}/tasks`;
  private readonly tagsUrl = `${environment.backendRootURL}/tags`;

  constructor(private readonly http: HttpClient) {}

  getUrl(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  getTasksBetweenDates(
    startDate: Date,
    endDate: Date
  ): Observable<ReadonlyArray<Task>> {
    return this.http
      .get<ReadonlyArray<TaskDto>>(this.tasksUrl, {
        params: {
          startDate: Task.getDateString(startDate),
          endDate: Task.getDateString(endDate),
        },
      })
      .pipe(map((taskDtos) => taskDtos.map(this.mapTask)));
  }

  /** Sort tasks according to their previous ID references */
  sortTasks(tasks: Array<Task>): ReadonlyArray<Task> {
    const unorderedTasks = new Set(tasks);
    const orderedTasks: Array<Task> = [];
    let lastTaskId: number | null = null;

    while (unorderedTasks.size > 0) {
      let foundTask: Task | undefined;
      for (const task of unorderedTasks) {
        if (task.previousId === lastTaskId) {
          orderedTasks.push(task);
          foundTask = task;
          lastTaskId = task.id;
          break;
        }
      }
      if (foundTask) {
        unorderedTasks.delete(foundTask);
      } else {
        console.error(
          'Could not reconstruct tasks order. Ordered tasks:',
          orderedTasks,
          'Unordered tasks:',
          tasks
        );
        return tasks; // avoid infinite loops in case of error
      } // tk
    }

    return orderedTasks;
  }

  addTask(taskDto: Omit<TaskDto, 'id'>): Observable<Task> {
    return this.http
      .post<TaskDto>(this.tasksUrl, taskDto)
      .pipe(map(this.mapTask));
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
      taskDto.duration,
      taskDto.tags
    );
  }

  deleteTask(taskId: number): Observable<DeleteTaskDto> {
    return this.http
      .delete<{ deletedTaskId: number; affectedTask: TaskDto | null }>(
        `${this.tasksUrl}/${taskId}`
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
      .put<TaskDto>(`${this.tasksUrl}/${task.id}`, task)
      .pipe(map(this.mapTask));
  }

  updateTasks(tasks: ReadonlyArray<TaskDto>): Observable<ReadonlyArray<Task>> {
    return this.http
      .put<ReadonlyArray<TaskDto>>(this.tasksUrl, tasks)
      .pipe(map((tasksDtos) => tasksDtos.map(this.mapTask)));
  }

  getTags(): Observable<ReadonlyArray<TagDto>> {
    return this.http.get<ReadonlyArray<TagDto>>(this.tagsUrl);
  }

  addTag(tagDto: Omit<TagDto, 'id'>): Observable<TagDto> {
    return this.http.post<TagDto>(this.tagsUrl, tagDto);
  }

  editTag(tagDto: TagDto): Observable<TagDto> {
    return this.http.put<TagDto>(`${this.tagsUrl}/${tagDto.id}`, tagDto);
  }
}
