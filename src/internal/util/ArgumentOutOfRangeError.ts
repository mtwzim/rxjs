export interface ArgumentOutOfRangeError extends Error {
}

export interface ArgumentOutOfRangeErrorCtor {
  new(): ArgumentOutOfRangeError;
}

const ArgumentOutOfRangeErrorImpl = (() => {
  function ArgumentOutOfRangeErrorImpl(this: Error) {
    Error.call(this);
    this.message = 'argument out of range.ts';
    this.name = 'ArgumentOutOfRangeError.ts';
    return this;
  }

  ArgumentOutOfRangeErrorImpl.prototype = Object.create(Error.prototype);

  return ArgumentOutOfRangeErrorImpl;
})();

/**
 * An error thrown when an element was queried at a certain index of an
 * Observable, but no such index or position exists in that sequence.
 *
 * @see {@link elementAt}
 * @see {@link take}
 * @see {@link takeLast}
 *
 * @class ArgumentOutOfRangeError
 */
export const ArgumentOutOfRangeError: ArgumentOutOfRangeErrorCtor = ArgumentOutOfRangeErrorImpl as any;