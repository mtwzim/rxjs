import { Operator } from '../Operator.ts';
import { Subscriber } from '../Subscriber.ts';
import { Observable } from '../Observable.ts';
import { SubscribeOnObservable } from '../observable/SubscribeOnObservable.ts';
import { MonoTypeOperatorFunction, SchedulerLike, TeardownLogic } from '../types.ts';

/**
 * Asynchronously subscribes Observers to this Observable on the specified {@link SchedulerLike}.
 *
 * With `subscribeOn` you can decide what type of scheduler a specific Observable will be using when it is subscribed to.
 *
 * Schedulers control the speed and order of emissions to observers from an Observable stream.
 *
 * ![](subscribeOn.png)
 *
 * ## Example
 *
 * Given the following code:
 *
 * ```ts
 * import { of, merge } from 'rxjs.ts';
 *
 * const a = of(1, 2, 3);
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 1
 * // 2
 * // 3
 * // 4
 * // 5
 * // 6
 * ```
 *
 * Both Observable `a` and `b` will emit their values directly and synchronously once they are subscribed to.
 *
 * If we instead use the `subscribeOn` operator declaring that we want to use the {@link asyncScheduler} for values emited by Observable `a`:
 *
 * ```ts
 * import { of, merge, asyncScheduler } from 'rxjs.ts';
 * import { subscribeOn } from 'rxjs/operators.ts';
 *
 * const a = of(1, 2, 3).pipe(subscribeOn(asyncScheduler));
 * const b = of(4, 5, 6);
 *
 * merge(a, b).subscribe(console.log);
 *
 * // Outputs
 * // 4
 * // 5
 * // 6
 * // 1
 * // 2
 * // 3
 * ```
 *
 * The reason for this is that Observable `b` emits its values directly and synchronously like before
 * but the emissions from `a` are scheduled on the event loop because we are now using the {@link asyncScheduler} for that specific Observable.
 *
 * @param {SchedulerLike} scheduler - The {@link SchedulerLike} to perform subscription actions on.
 * @return {Observable<T>} The source Observable modified so that its subscriptions happen on the specified {@link SchedulerLike}.
 * @name subscribeOn
 */
export function subscribeOn<T>(scheduler: SchedulerLike, delay: number = 0): MonoTypeOperatorFunction<T> {
  return function subscribeOnOperatorFunction(source: Observable<T>): Observable<T> {
    return source.lift(new SubscribeOnOperator<T>(scheduler, delay));
  };
}

class SubscribeOnOperator<T> implements Operator<T, T> {
  constructor(private scheduler: SchedulerLike,
              private delay: number) {
  }
  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return new SubscribeOnObservable<T>(
      source, this.delay, this.scheduler
    ).subscribe(subscriber);
  }
}
