import { XhrFactory } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Injectable } from '@angular/core';
import { asyncScheduler, mergeMap, Observable, observeOn, tap } from 'rxjs';
import { InitialRenderPendingTasks } from '../app.component';

@Injectable({ providedIn: 'root' })
export class MockHttp {
  private readonly tasks = inject(InitialRenderPendingTasks);
  private readonly xhr = inject(XhrFactory);
  counter = 0;

  get() {
    this.counter++;

    return new Observable<string>((obs) => {
      const xhr = this.xhr.build();
      xhr.open('GET', 'http://localhost:4300/api');

      let id: number;
      xhr.addEventListener('loadstart', () => {
        id = this.tasks.add();
        console.log(`add task ${id}`);
      });
      xhr.addEventListener('loadend', () => {
        this.tasks.remove(id);
        console.log(`remove task ${id}`);
      });
      xhr.addEventListener('load', () => {
        obs.next(`response for task: ${this.counter}`);
        obs.complete();
      });
      xhr.addEventListener('onerror', console.error);

      xhr.send();
    });
  }
}

@Component({
  selector: 'app-customers',
  template: '{{ text }}',
})
export class CustomersComponent {
  text = 'no response';
  private readonly http = inject(MockHttp);

 async ngOnInit() {
    this.http
      .get()
      .pipe(
        tap((data) => this.text = data),
        mergeMap(() => this.http.get()),
        tap((data) => this.text = data),
        observeOn(asyncScheduler),
        mergeMap(() => this.http.get()),
        tap((data) => this.text = data),
      )
      .subscribe();
  }


}
