import { createFailure, createSuccess, syncThen as then } from './utils'
import { SuccessOf, FailureOf, CombinedResult, Result as ResultType } from './types'

export type Result<Success = unknown, Failure = unknown> = ResultType<Success, Failure>

/**
 * Returns a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<NewSuccess, NewFailure> = Result<NewSuccess, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

/**
 * Returns a closure that takes a new result, mapping any success value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the success value of the `result`.
 * @returns A closure that takes a `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function flatMap<
  NewSuccess,
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<NewSuccess, NewFailure> = Result<NewSuccess, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewResultLike
): (result: ResultLike) => Result<SuccessOf<NewResultLike>, FailureOf<NewResultLike | ResultLike>>

function flatMap<NewSuccess, NewFailure, Success, Failure>(
  transform: (success: Success) => Result<NewSuccess, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMap(transform, r)
    : then(result, (r) => (r.tag === 'success' ? transform(r.success) : r))
}

/**
 * Returns a new result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a success. The following example transforms
 * the number success value of a result into a string:
 *
 *      function getNextNumber(): Result<number, Error> { ... }
 *
 *      const numberResult = getNextNumber()
 *      // numberResult == Result.success(5)
 *      const stringResult = Result.map((value) => `${value}`, numberResult)
 *      // stringResult == Result.success('5')
 *
 * @param transform A closure that takes the success value of `result`.
 * @param result Original `Result`.
 * @returns A `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess,
  result: ResultLike
): Result<NewSuccess, FailureOf<ResultLike>>

/**
 * Returns a closure that takes a new result, mapping any success value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a success. The following example transforms
 * the number success value of a result into a string:
 *
 *      function getNextNumber(): Result<number, Error> { ... }
 *
 *      const numberResult = getNextNumber()
 *      // numberResult == Result.success(5)
 *      const stringResult = Result.map((value) => `${value}`)(numberResult)
 *      // stringResult == Result.success('5')
 *
 * @param transform A closure that takes the success value of `result`.
 * @returns A closure that takes a `Result` value with the result of evaluating `transform` as the new success value if `result` represents a success.
 */
function map<
  NewSuccess,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (success: SuccessOf<ResultLike>) => NewSuccess
): (result: ResultLike) => Result<NewSuccess, FailureOf<ResultLike>>

function map<NewSuccess, Success, Failure>(
  transform: (success: Success) => NewSuccess,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? flatMap<NewSuccess, Failure, Success, Failure>((value) => createSuccess(transform(value)))
    : flatMap((value) => createSuccess(transform(value)), result)
}

/**
 * Returns a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @param result Original `Result`.
 * @returns A `Result` value, either from the closure or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike,
  result: ResultLike
): Result<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

/**
 * Returns a closure that takes a new result, mapping any failure value using the given
 * transformation and unwrapping the produced result.
 *
 * @param transform A closure that takes the failure value of the `result`.
 * @returns A closure that takes a `Result` value, either from the closure or the previous `success`.
 */
function flatMapError<
  NewFailure,
  Success,
  Failure,
  NewResultLike extends Result<never, NewFailure> = Result<never, NewFailure>,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewResultLike
): (result: ResultLike) => Result<SuccessOf<ResultLike>, FailureOf<NewResultLike>>

function flatMapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => Result<never, NewFailure>,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? (r: Result<Success, Failure>) => flatMapError(transform, r)
    : then(result, (r) => (r.tag === 'success' ? r : transform(r.failure)))
}

/**
 * Returns a new result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a failure. The following example transforms
 * the error value of a result by wrapping it in a custom `Error` type:
 *
 *      class DatedError extends Error {
 *        readonly date: Date = new Date()
 *      }
 *
 *      const result: Result<number, Error> = // ...
 *      // result == Result.failure(<error value>)
 *      const resultWithDatedError = Result.mapError((value) => new DatedError(value.message), result)
 *      // result == Result.failure(DatedError(date: <date>))
 *
 *  @param transform A closure that takes the failure value of the `result`.
 *  @param result Original `Result`.
 *  @returns A `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure,
  result: ResultLike
): Result<SuccessOf<ResultLike>, NewFailure>

/**
 * Returns a closure that takes a result, mapping any failure value using the given
 * transformation.
 *
 * Use this method when you need to transform the value of a `Result`
 * value when it represents a failure. The following example transforms
 * the error value of a result by wrapping it in a custom `Error` type:
 *
 *      class DatedError extends Error {
 *        readonly date: Date = new Date()
 *      }
 *
 *      const result: Result<number, Error> = // ...
 *      // result == Result.failure(<error value>)
 *      const resultWithDatedError = Result.mapError((value) => new DatedError(value.message))(result)
 *      // result == Result.failure(DatedError(date: <date>))
 *
 *  @param transform A closure that takes the failure value of the `result`.
 *  @returns A closure that takes `Result` value with the result of evaluating `transform` as the new failure value if `result` represents a failure.
 */
function mapError<
  NewFailure,
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(
  transform: (failure: FailureOf<ResultLike>) => NewFailure
): (result: ResultLike) => Result<SuccessOf<ResultLike>, NewFailure>

function mapError<NewFailure, Success, Failure>(
  transform: (failure: Failure) => NewFailure,
  result?: Result<Success, Failure>
) {
  return result === undefined
    ? flatMapError<NewFailure, Success, Failure>((value: Failure) =>
        createFailure(transform(value))
      )
    : flatMapError((value) => createFailure(transform(value)), result)
}

/**
 * Extracts wrapped value from result
 *
 * @returns A closure that takes an `Result` and returns wrapped value
 */
function unwrap<
  Success,
  Failure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(): (result: ResultLike) => SuccessOf<ResultLike> | FailureOf<ResultLike>

/**
 * Extracts wrapped value from result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: SuccessOf<ResultLike>) => UnwrapSuccess
  readonly failure: (val: FailureOf<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => UnwrapSuccess | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms success and failure cases
 *
 * @param transform Success & failure transformers
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: Success) => UnwrapSuccess
  readonly failure: (val: Failure) => UnwrapFailure
}): (result: ResultLike) => UnwrapSuccess | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms failure case
 * or returns success value as is
 *
 * @param transform Failure transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly failure: (val: FailureOf<ResultLike>) => UnwrapFailure
}): (result: ResultLike) => SuccessOf<ResultLike> | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms failure case
 * or returns success value as is
 *
 * @param transform Failure transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapFailure,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly failure: (val: Failure) => UnwrapFailure
}): (result: ResultLike) => SuccessOf<ResultLike> | UnwrapFailure

/**
 * Extracts wrapped value from result and transforms success case
 * or returns failure value as is
 *
 * @param transform Success transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: SuccessOf<ResultLike>) => UnwrapSuccess
}): (result: ResultLike) => UnwrapSuccess | FailureOf<ResultLike>

/**
 * Extracts wrapped value from result and transforms success case
 * or returns failure value as is
 *
 * @param transform Success transformer
 * @returns A closure that takes a `Result` and returns transformed wrapped value
 */
function unwrap<
  Success,
  Failure,
  UnwrapSuccess,
  ResultLike extends Result<Success, Failure> = Result<Success, Failure>
>(transform: {
  readonly success: (val: Success) => UnwrapSuccess
}): (result: ResultLike) => UnwrapSuccess | FailureOf<ResultLike>

function unwrap<Success, Failure, UnwrapSuccess, UnwrapFailure>(transform?: {
  readonly success?: (val: Success) => UnwrapSuccess
  readonly failure?: (val: Failure) => UnwrapFailure
}) {
  return (result: Result<Success, Failure>) =>
    then(result, (r) =>
      r.tag === 'success'
        ? transform?.success?.(r.success) ?? r.success
        : transform?.failure?.(r.failure) ?? r.failure
    )
}

/**
 * Combines multiple results into single one
 *
 * @param results `Result`s to combine
 * @returns A `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
  TupleResults extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])]
>(...results: TupleResults): CombinedResult<'result', 'tuple', ResultLike, TupleResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds a tuple of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])],
  Args = {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  },
  Res = CombinedResult<
    'result',
    'tuple',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  >
>(...results: FunResults): Args extends readonly undefined[] ? () => Res : (args: Args) => Res

/**
 * Combines multiple results into single one
 *
 * @param results Object map of `Result`s to combine
 * @returns A `Result` that holds an object map of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
  MapResults extends Readonly<Record<string, ResultLike>>
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...results: {} extends MapResults ? never : readonly [MapResults]
): CombinedResult<'result', 'map', ResultLike, MapResults>

/**
 * Combines multiple closures that take one argument and return result into single one
 *
 * @param results Closures to combine
 * @returns A closure that takes one argument and returns a `Result` that holds an object map of `results` successes or a single failure
 */
function combine<
  ResultLike extends Result,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends Readonly<Record<string, FunResultLike>>,
  Arg = {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  },
  Res = CombinedResult<
    'result',
    'map',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  >
>(
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...results: {} extends FunResults ? never : readonly [FunResults]
): Arg extends Record<string, undefined> ? () => Res : (arg: Arg) => Res

function combine<
  ResultLike extends Result,
  FunResultLike extends (arg: never) => ResultLike,
  TupleResults extends readonly [ResultLike, ResultLike, ...(readonly ResultLike[])],
  TupleFunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])],
  MapResults extends Readonly<Record<string, ResultLike>>,
  MapFunResults extends Readonly<Record<string, FunResultLike>>
>(
  ...results:
    | Readonly<TupleResults>
    | readonly [MapResults]
    | Readonly<TupleFunResults>
    | readonly [MapFunResults]
) {
  function isTupleFunResults(value: typeof results): value is TupleFunResults {
    return value.length > 1 && typeof value[0] === 'function'
  }

  function isTupleResults(
    value: TupleResults | readonly [MapResults] | TupleFunResults | readonly [MapFunResults]
  ): value is TupleResults {
    return value.length > 1
  }

  function isMapFunResults(
    value: readonly [MapResults] | readonly [MapFunResults]
  ): value is readonly [MapFunResults] {
    const [maybeMap] = value
    const firstKey = Object.keys(maybeMap)[0]
    return firstKey !== undefined && typeof maybeMap[firstKey] === 'function'
  }

  if (isTupleFunResults(results)) {
    return combineFunTuple(results)
  }

  if (isTupleResults(results)) {
    return combineIter(results, [])
  }

  if (isMapFunResults(results)) {
    return combineFunMap(results)
  }

  const [resultMap] = results
  const keys = Object.keys(resultMap)

  return map(
    (rs) => keys.reduce((acc, val, idx) => ({ ...acc, [val]: rs[idx] }), {}),
    combineIter(
      keys.map((key) => resultMap[key]),
      []
    )
  )
}

/** @hidden */
function combineFunTuple<
  ResultLike extends Result,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends readonly [FunResultLike, FunResultLike, ...(readonly FunResultLike[])]
>(funResults: FunResults) {
  return (args: {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  }): CombinedResult<
    'result',
    'tuple',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  > => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return combine(...funResults.map((fun, i) => fun((args ?? [])[i])))
  }
}

/** @hidden */
function combineFunMap<
  ResultLike extends Result,
  FunResultLike extends (arg: never) => ResultLike,
  FunResults extends Readonly<Record<string, FunResultLike>>
>(funResults: readonly [FunResults]) {
  return (arg: {
    readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
      ? Parameters<FunResults[Index]>[0]
      : never
  }): CombinedResult<
    'result',
    'map',
    ResultLike,
    {
      readonly [Index in keyof FunResults]: FunResults[Index] extends FunResultLike
        ? ReturnType<FunResults[Index]>
        : never
    }
  > => {
    const [funResult] = funResults
    const keys = Object.keys(funResult)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return combine(keys.reduce((acc, k) => ({ ...acc, [k]: funResult[k]((arg ?? {})[k]) }), {}))
  }
}

/** @hidden */
const combineIter = <ResultLike extends Result>(
  results: readonly ResultLike[],
  successes: ReadonlyArray<SuccessOf<ResultLike>>
): Result<ReadonlyArray<SuccessOf<ResultLike>>, FailureOf<ResultLike>> =>
  results.length === 1
    ? map((success) => [...successes, success], results[0])
    : flatMap((success) => combineIter(results.slice(1), [...successes, success]), results[0])

export const Result = {
  success: createSuccess,
  failure: createFailure,
  map,
  flatMap,
  mapError,
  flatMapError,
  unwrap,
  combine
} as const
