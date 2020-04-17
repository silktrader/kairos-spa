import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddHabitDialogComponent } from './components/add-habit-dialog/add-habit-dialog.component';
import { EditHabitDialogComponent } from './components/edit-habit-dialog/edit-habit-dialog.component';
import { MaterialModule } from '../material/material.module';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [AddHabitDialogComponent, EditHabitDialogComponent],
  imports: [CommonModule, CoreModule, MaterialModule],
  exports: [],
  entryComponents: [AddHabitDialogComponent, EditHabitDialogComponent],
})
export class HabitsModule {}
