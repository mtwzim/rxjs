import { Operator } from '../Operator.ts';
import { Observable } from '../Observable.ts';
import { Subscriber } from '../Subscriber.ts';
import { Observer, OperatorFunction } from '../types.ts';

/**
 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
 *
 * <span class="informal">If all values pass predicate before the source completes, emits true before completion,
 * otherwise emit false, then complete.</span>
 *
 * ![](every.png)
 *
 * ## Example
 * A simple example emitting true if all elements are less than 5, false otherwise
 * ```ts
 * import { of } from 'rxjs.ts';
 * import { every } from 'rxjs/operators.ts';
 *
 *  of(1, 2, 3, 4, 5, 6).pipe(
 *     every(x => x < 5),
 * )
 * .subscribe(x => console.log(x)); // -> false
 * ```
 *
 * @param {function} predicate A function for determining if an item meets a specified condition.
 * @param {any} [thisArg] Optional object to use for `this` in the callback.
 * @return {Observable} An Observable of booleans that determines if all items of the source Observable meet the condition specified.
 * @name every
 */
export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean,
                         thisArg?: any): OperatorFunction<T, boolean> {
  return (source: Observable<T>) => source.lift(new EveryOperator(predicate, thisArg, source));
}

class EveryOperator<T> implements Operator<T, boolean> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source: Observable<T>) {
  }

  call(observer: Subscriber<boolean>, source: any): any {
    return source.subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class EverySubscriber<T> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<boolean>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source: Observable<T>) {
    super(destination);
    this.thisArg = thisArg || this;
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }

  protected _next(value: T): void {
    let result = false;
    try {
      result = this.predicate.call(this.thisArg, value, this.index++, this.source);
    } catch (err) {
      this.destination.error(err);
      return;
    }

    if (!result) {
      this.notifyComplete(false);
    }
  }

  protected _complete(): void {
    this.notifyComplete(true);
  }
}
