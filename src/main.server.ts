import 'zone.js';
import { ApplicationRef } from '@angular/core';
import { INITIAL_CONFIG, platformServer } from '@angular/platform-server';
import { combineLatest, first, tap } from 'rxjs';
import { InitialRenderPendingTasks } from './app/app.component';

import { AppServerModule } from './app/app.server.module';

const express = require('express');
const app = express();

app.get('/api', (req: any, res: any) => {
  setTimeout(() => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ data: 'API response' });
  }, 300);
});
app.listen(4300, () => {
  console.log('Server listening on port http://localhost:4206');
});

const platform = platformServer([
  { provide: INITIAL_CONFIG, useValue: { document: '<app-root>' } },
]);

platform.bootstrapModule(AppServerModule).then((moduleOrApplicationRef) => {
  const environmentInjector = moduleOrApplicationRef.injector;
  const applicationRef = environmentInjector.get(ApplicationRef);
  const tasks = environmentInjector.get(InitialRenderPendingTasks);

  Promise.allSettled([
    applicationRef.isStable
      .pipe(
        tap((isStable) => console.log({isStable,taskSize:  tasks.size})),
        first((isStable) => isStable && tasks.size  === 0),
      )
      .toPromise(),
  ]).then(() => {
     console.warn('>> Application is stable');
     platform.destroy();
  });

  // Promise.allSettled([
  //   applicationRef.isStable
  //     .pipe(
  //       tap((isStable) => console.log({ isStable })),
  //       first((isStable) => isStable)
  //     )
  //     .toPromise(),
  //   tasks.whenAllTasksComplete.then(() =>
  //     console.log({ whenAllTasksComplete: true })
  //   ),
  // ]).then(() => {
  //   console.warn('>> Application is stable');
  //   platform.destroy();
  // });
});
