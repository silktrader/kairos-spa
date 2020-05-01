import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GeneralErrorHandler implements ErrorHandler {
  // Because of this we should manually inject the services with Injector.
  constructor(private injector: Injector) {}

  handleError(error: Error) {
    const ns = this.injector.get(NotificationService);

    // tk must handle HTTP errors differently later

    // pop up a dialog with a notification
    ns.warnError(error);

    // always log the error to the console
    console.error(error);
  }
}
