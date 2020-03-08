import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as Reducers from './store/schedule.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { HomeComponent } from './pages/home/home.component';
import { DayViewComponent } from './pages/day-view/day-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { environment } from '../environments/environment'; // Angular CLI environment

@NgModule({
  declarations: [AppComponent, HomeComponent, DayViewComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot({ schedule: Reducers.taskReducer }),
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production
    }),
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
