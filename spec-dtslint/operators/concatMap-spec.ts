import { of } from 'rxjs.ts';
import { concatMap } from 'rxjs/operators.ts';

it('should infer correctly', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should support a projector that takes an index', () => {
  const o = of(1, 2, 3).pipe(concatMap((p, index) => of(Boolean(p)))); // $ExpectType Observable<boolean>
});

it('should infer correctly by using the resultSelector first parameter', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)), a => a)); // $ExpectType Observable<number>
});

it('should infer correctly by using the resultSelector second parameter', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)), (a, b) => b)); // $ExpectType Observable<boolean>
});

it('should support a resultSelector that takes an inner index', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)), (a, b, innnerIndex) => a)); // $ExpectType Observable<number>
});

it('should support a resultSelector that takes an inner and outer index', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)), (a, b, innnerIndex, outerIndex) => a)); // $ExpectType Observable<number>
});

it('should support an undefined resultSelector', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => of(Boolean(p)), undefined)); // $ExpectType Observable<boolean>
});

it('should support union-type projections', () => {
  const o = of(Math.random()).pipe(concatMap(n => n > 0.5 ? of('life') : of(42))); // $ExpectType Observable<string | number>
});

it('should enforce types', () => {
  const o = of(1, 2, 3).pipe(concatMap()); // $ExpectError
});

it('should enforce the return type', () => {
  const o = of(1, 2, 3).pipe(concatMap(p => p)); // $ExpectError
});

it('should produce `Observable<never>` when mapping to an `ObservableInput<never>`', () => {
  const o = of(1, 2, 3).pipe(concatMap(n => Promise.reject())); // $ExpectType Observable<never>
});
