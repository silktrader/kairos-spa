import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../material/material.module';
import { GeneralErrorDialogComponent } from './components/general-error-dialog/general-error-dialog.component';
import { GeneralErrorHandler } from './general-error-handler';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';

@NgModule({
  declarations: [GeneralErrorDialogComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    KeyboardShortcutsModule.forRoot(),
  ],
  exports: [
    CommonModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    KeyboardShortcutsModule,
  ],
  entryComponents: [GeneralErrorDialogComponent],
  providers: [{ provide: ErrorHandler, useClass: GeneralErrorHandler }],
})
export class CoreModule {}
