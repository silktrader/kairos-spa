import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Task } from 'src/app/models/task';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DayService } from 'src/app/services/day.service';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.scss']
})
export class EditTaskDialogComponent implements OnInit {
  taskForm = this.formBuilder.group(
    {
      title: undefined,
      details: undefined,
      date: undefined
    },
    { updateOn: 'blur' }
  );

  private readonly subscription = new Subscription();
  private changed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    private readonly formBuilder: FormBuilder,
    private readonly ds: DayService
  ) {}

  ngOnInit(): void {
    this.resetForm();

    this.subscription.add(
      this.taskForm.valueChanges.subscribe(() => {
        this.saveTask();
        this.changed = true;
      })
    );
  }

  public resetForm() {
    if (this.initialTask) {
      this.taskForm.patchValue(this.initialTask);
    } else {
      this.taskForm.reset();
    }
  }

  saveTask(): void {
    // merge data with spread operator
    this.ds.updateTask({ ...this.initialTask, ...this.taskForm.value });
  }

  deleteTask(): void {
    // the ID of a task won't ever change since inception
    this.ds.deleteTask(this.initialTask.id);

    // tk should check for effective deletion by listening to observable?
    this.dialogRef.close();
  }

  public get hasChanged(): boolean {
    return this.changed;
  }
}
