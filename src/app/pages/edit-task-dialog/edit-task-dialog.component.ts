import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Task } from 'src/app/models/task';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
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

  constructor(
    @Inject(MAT_DIALOG_DATA) public initialTask: Task,
    private readonly formBuilder: FormBuilder,
    private readonly ds: DayService
  ) {}

  ngOnInit(): void {
    this.resetForm();

    this.subscription.add(
      this.taskForm.valueChanges.subscribe(() => this.saveTask())
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
}
