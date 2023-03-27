import { Component, inject, Injectable, NgZone } from '@angular/core';
import { Observable, Observer, share, startWith } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InitialRenderPendingTasks3 {
  private taskId = 0;
  private collection = new Set<number>();

  private resolve!: VoidFunction;
  private promise = new Promise<void>((resolve) => {
    this.resolve = resolve;
  });

  private ngZone = inject(NgZone);
  private timeout: any;

  get whenAllTasksComplete(): Promise<void> {
    if (this.collection.size > 0) {
      return this.promise;
    }
    return Promise.resolve().then(() => {
      this.completed = true;
    });
  }

  completed = false;

  add(): number {
    if (this.completed) {
      return -1;
    }
    const taskId = this.taskId++;
    this.collection.add(taskId);
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    return taskId;
  }

  remove(taskId: number) {
    if (this.completed) return;

    this.collection.delete(taskId);
    if (this.collection.size === 0) {
      this.ngZone.runOutsideAngular(() => {
        if (this.timeout) {
          clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
          console.warn('All tasks completed.');
          this.completed = true;
          this.resolve();
        }, 0);
      });
    }
  }
}

//
@Injectable({ providedIn: 'root' })
export class InitialRenderPendingTasks {
  private taskId = 0;
  private readonly tasks = new Set<number>();
  private readonly ngZone = inject(NgZone);
  private observer!: Observer<boolean>;
  private readonly observable = new Observable<boolean>(
    (observer) => (this.observer = observer)
  ).pipe(share(), startWith(true));

  get noPendingTasks(): Observable<boolean> {
    return this.observable;
  }

  get size() {
    return this.tasks.size;
  }

  add(): number {
    const taskId = this.taskId++;
    this.tasks.add(taskId);
    this.observer?.next(false);

    return taskId;
  }

  remove(taskId: number) {

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {

        this.tasks.delete(taskId);

    if (this.tasks.size > 0) {
      return;
    }


        this.observer?.next(this.tasks.size === 0);
      });
    });
  }
}

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent {}
