import { Operator } from '../Operator.ts';
import { Subscriber } from '../Subscriber.ts';
import { Observable } from '../Observable.ts';
import { Subject } from '../Subject.ts';
import { Subscription } from '../Subscription.ts';

import { OuterSubscriber } from '../OuterSubscriber.ts';
import { InnerSubscriber } from '../InnerSubscriber.ts';
import { subscribeToResult } from '../util/subscribeToResult.ts';

import { MonoTypeOperatorFunction, TeardownLogic } from '../types.ts';

/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will emit the Throwable that caused the error to the Observable returned from `notifier`.
 * If that Observable calls `complete` or `error` then this method will call `complete` or `error` on the child
 * subscription. Otherwise this method will resubscribe to the source Observable.
 *
 * ![](retryWhen.png)
 *
 * Retry an observable sequence on error based on custom criteria.
 *
 * ## Example
 * ```ts
 * import { timer, interval } from 'rxjs.ts';
 * import { map, tap, retryWhen, delayWhen } from 'rxjs/operators.ts';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   map(val => {
 *     if (val > 5) {
 *       // error will be picked up by retryWhen
 *       throw val;
 *     }
 *     return val;
 *   }),
 *   retryWhen(errors =>
 *     errors.pipe(
 *       // log error message
 *       tap(val => console.log(`Value ${val} was too high!`)),
 *       // restart in 5 seconds
 *       delayWhen(val => timer(val * 1000))
 *     )
 *   )
 * );
 *
 * const subscribe = example.subscribe(val => console.log(val));
 *
 * // results:
 * //   0
 * //   1
 * //   2
 * //   3
 * //   4
 * //   5
 * //   "Value 6 was too high!"
 * //  --Wait 5 seconds then repeat
 * ```
 *
 * @param {function(errors: Observable): Observable} notifier - Receives an Observable of notifications with which a
 * user can `complete` or `error`, aborting the retry.
 * @return {Observable} The source Observable modified with retry logic.
 * @name retryWhen
 */
export function retryWhen<T>(notifier: (errors: Observable<any>) => Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(new RetryWhenOperator(notifier, source));
}

class RetryWhenOperator<T> implements Operator<T, T> {
  constructor(protected notifier: (errors: Observable<any>) => Observable<any>,
              protected source: Observable<T>) {
  }

  call(subscriber: Subscriber<T>, source: any): TeardownLogic {
    return source.subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class RetryWhenSubscriber<T, R> extends OuterSubscriber<T, R> {

  private errors: Subject<any> | null = null;
  private retries: Observable<any> | null = null;
  private retriesSubscription: Subscription | null | undefined = null;

  constructor(destination: Subscriber<R>,
              private notifier: (errors: Observable<any>) => Observable<any>,
              private source: Observable<T>) {
    super(destination);
  }

  error(err: any) {
    if (!this.isStopped) {

      let errors = this.errors;
      let retries = this.retries;
      let retriesSubscription = this.retriesSubscription;

      if (!retries) {
        errors = new Subject();
        try {
          const { notifier } = this;
          retries = notifier(errors);
        } catch (e) {
          return super.error(e);
        }
        retriesSubscription = subscribeToResult(this, retries);
      } else {
        this.errors = null;
        this.retriesSubscription = null;
      }

      this._unsubscribeAndRecycle();

      this.errors = errors;
      this.retries = retries;
      this.retriesSubscription = retriesSubscription;

      errors!.next(err);
    }
  }

  /** @deprecated This is an internal implementation detail, do not use. */
  _unsubscribe() {
    const { errors, retriesSubscription } = this;
    if (errors) {
      errors.unsubscribe();
      this.errors = null;
    }
    if (retriesSubscription) {
      retriesSubscription.unsubscribe();
      this.retriesSubscription = null;
    }
    this.retries = null;
  }

  notifyNext(outerValue: T, innerValue: R,
             outerIndex: number, innerIndex: number,
             innerSub: InnerSubscriber<T, R>): void {
    const { _unsubscribe } = this;

    this._unsubscribe = null!;
    this._unsubscribeAndRecycle();
    this._unsubscribe = _unsubscribe;

    this.source.subscribe(this);
  }
}
