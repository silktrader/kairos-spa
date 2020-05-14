import { AppComponent } from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import * as Reducers from './store/schedule.reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment'; // Angular CLI environment
import { EffectsModule } from '@ngrx/effects';
import { ScheduleModule } from './schedule/schedule.module';
import { resetReducer } from './store/schedule.reducers';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(
      { schedule: Reducers.scheduleReducer },
      { metaReducers: [resetReducer] }
    ),
    EffectsModule.forRoot([]), // must register for feature effects to work
    StoreDevtoolsModule.instrument({
      maxAge: 10,
      logOnly: environment.production,
    }),
    ScheduleModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
