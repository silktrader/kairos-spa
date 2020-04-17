import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  exports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule],
})
export class CoreModule {}
