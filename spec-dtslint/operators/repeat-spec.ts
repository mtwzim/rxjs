import { of } from 'rxjs.ts';
import { repeat } from 'rxjs/operators.ts';

it('should infer correctly', () => {
  const o = of('a', 'b', 'c').pipe(repeat()); // $ExpectType Observable<string>
});

it('should accept a count parameter', () => {
  const o = of('a', 'b', 'c').pipe(repeat(47)); // $ExpectType Observable<string>
});

it('should enforce types', () => {
  const o = of('a', 'b', 'c').pipe(repeat('aa')); // $ExpectError
});
