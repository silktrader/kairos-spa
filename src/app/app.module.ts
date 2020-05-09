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
import { environment } from '../environments/environment'; // Angular CLI environment
import { AuthComponent } from './pages/auth/auth.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SortablejsModule } from 'ngx-sortablejs';
import { EffectsModule } from '@ngrx/effects';
import { EventsSidebarComponent } from './pages/sidebar/events-sidebar/events-sidebar.component';
import { HabitsSidebarComponent } from './pages/sidebar/habits-sidebar/habits-sidebar.component';
import { HabitsModule } from './habits/habits.module';
import { CoreModule } from './core/core.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DayViewComponent,
    AuthComponent,
    SigninComponent,
    EventsSidebarComponent,
    HabitsSidebarComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule,
    StoreModule.forRoot({ schedule: Reducers.scheduleReducer }),
    EffectsModule.forRoot([]), // must register for feature effects to work
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production,
    }),
    BrowserAnimationsModule,
    MaterialModule,
    AuthModule.forRoot({ backendUrl: 'http://localhost:3000/auth/' }),
    SortablejsModule.forRoot({ animation: 150 }),
    HabitsModule,
    TasksModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
