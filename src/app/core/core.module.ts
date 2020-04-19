import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TasksErrorDialogComponent } from './components/error-dialog/tasks-error-dialog.component';
import { MaterialModule } from '../material/material.module';

@NgModule({
  declarations: [TasksErrorDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
  ],
  exports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  entryComponents: [TasksErrorDialogComponent],
})
export class CoreModule {}
