import { bootstrapApplication } from '@angular/platform-browser';
import { startServer } from '@planess/train-a-backend';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { startServer } from '@planess/train-a-backend';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
