import { None, Option } from "./option";

/**
 * Result is a type that represents either success (Ok) or failure (Err). It is used to return and propagate errors. It is a common idiom in Rust and other languages. The monadic Result type is used to chain operations on the value regardless of its status.
 */

/**
 * Functor chaining for Result. Enables chaining of operations on the value regardless of its status.
 * In the case of a Ok value, the function is applied to the value. In the case of a Err value, the function is not applied.
 */
export interface ResultFunctor<T, E> {
	/**
	 * Applies a function to the value of the result. If the result is an Ok then the function is applied to the value, otherwise it returns the error and ignores the function.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok(10);
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.map(value => value * 2)); // Ok(20)
	 * console.log(err.map(value => value * 2)); // Err("An error occurred")
	 * ```
	 *
	 * @param fn The function to apply to the value.
	 */
	flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
	/**
	 * Applies a function to the value of the result. If the result is an Ok then the function is applied to the value, otherwise it returns the error and ignores the function.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok(10);
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.flatMap(value => Ok(value * 2)); // Ok(20)
	 * console.log(err.flatMap(value => Ok(value * 2)); // Err("An error occurred")
	 * ```
	 *
	 * @param fn The function to apply to the value.
	 */
	flatMapAsync<U>(
		fn: (value: T) => Promise<Result<U, E>>,
	): Promise<Result<U, E>>;
}

/**
 * Functor chaining for Result. Enables chaining of operations on the value regardless of its status.
 * In the case of a Ok value, the function is applied to the value. In the case of a Err value, the function is not applied.
 */
export interface ErrorFunctor<T, E> extends ResultFunctor<T, E> {
	/**
	 * Applies a function to the error of the result. If the result is an Err then the function is applied to the error, otherwise it returns the value and ignores the function.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok(10);
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.map(value => value * 2)); // Ok(20)
	 * console.log(err.map(value => value * 2)); // Err("An error occurred")
	 * ```
	 *
	 * @param fn The function to apply to the value.
	 */
	map<U>(fn: (value: T) => U): Result<T, E>;
}

/**
 * Functor chaining for Result. Enables chaining of operations on the value regardless of its status.
 * In the case of a Ok value, the function is applied to the value. In the case of a Err value, the function is not applied.
 */
export interface SuccessFunctor<T, E> extends ResultFunctor<T, E> {
	/**
	 * Applies a function to the value of the result. If the result is an Ok then the function is applied to the value, otherwise it returns the error and ignores the function.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok(10);
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.map(value => value * 2)); // Ok(20)
	 * console.log(err.map(value => value * 2)); // Err("An error occurred")
	 * ```
	 *
	 * @param fn The function to apply to the value.
	 */
	map<U>(fn: (value: T) => U): Result<U, E>;
}

/**
 * Represents a value that can be converted to an Option.
 */
export interface Optional<T> {
	/**
	 * Converts the result into an Option
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok("A successful operation");
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.toOption()); // Some("A successful operation")
	 * console.log(err.toOption()); // None
	 * ```
	 *
	 * @returns Some if the result is a Ok, otherwise None.
	 */
	toOption(): Option<T>;
}

/**
 * Represents a value that can be pattern matched.
 * Matches on the existence of a value and performs the handler function.
 */
export interface Matchable<T, E> {
	/**
	 * Matches on the value and performs the handler function.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const result = Ok("A successful operation");
	 * result.match({
	 *  Ok: value => console.log(value),
	 *  Err: error => console.error(error),
	 * });
	 * ```
	 *
	 * @param handlers The handler functions to perform.
	 * @returns The value returned by the handler function.
	 */
	match<R>(
		this: Result<T, E>,
		handlers: {
			Ok: (value: T) => R;
			Err: (error: E) => R;
		},
	): R;
}

/**
 * Represents a successful result.
 * The result contains a value and no error.
 *
 * @example
 * ```ts
 * import { Ok } from "@walln/outcomes"
 *
 * const result = Ok("A successful operation");
 * console.log(result.value); // "A successful operation"
 * ```
 *
 * @typeparam T The type of the value.
 * @typeparam E The type of the error.
 */
export interface Success<T, E>
	extends Matchable<T, E>,
		SuccessFunctor<T, E>,
		Optional<T> {
	/**
	 * The type of the result.
	 */
	type: "value";
	/**
	 * The value of the result.
	 */
	value: T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it panics with the provided error.
	 *
	 * @example
	 * ```ts
	 * import { Ok } from "@walln/outcomes"
	 *
	 * const result = Ok("A successful operation");
	 * console.log(result.unwrap()); // "A successful operation"
	 * ```
	 *
	 * @returns The value of the result.
	 */
	unwrap(): T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it returns the provided default value.
	 *
	 * @example
	 * ```ts
	 * import { Ok } from "@walln/outcomes"
	 *
	 * const result = Ok("A successful operation");
	 * console.log(result.unwrapOr("A default value")); // "A successful operation"
	 * ```
	 *
	 * @param defaultValue The default value to return if the value is an Err.
	 * @returns The value of the result or the default value.
	 */
	unwrapOr(defaultValue: T): T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it returns the result of evaluating the provided default value function.
	 *
	 * @example
	 * ```ts
	 * import { Ok } from "@walln/outcomes"
	 *
	 * const result = Ok("A successful operation");
	 * console.log(result.unwrapOrElse(() => "A default value")); // "A successful operation"
	 * ```
	 *
	 * @param fn The function to evaluate if the value is an Err.
	 * @returns The value of the result or the default value.
	 */
	unwrapOrElse(fn: (error: E) => T): T;
	/**
	 * Returns true if the result is a Ok.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok("A successful operation");
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.ok()); // true
	 * console.log(err.ok()); // false
	 * ```
	 *
	 * @returns True if the result is a Ok.
	 */
	ok(this: Result<T, E>): this is Success<T, E>;
	/**
	 * Returns true if the result is a Err.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok("A successful operation");
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.err()); // false
	 * console.log(err.err()); // true
	 * ```
	 *
	 * @returns True if the result is a Err.
	 */
	err(this: Result<T, E>): this is Failure<T, E>;
}

/**
 * Represents a failed result.
 * The result contains an error and no value.
 *
 * @example
 * ```ts
 * import { Err } from "@walln/outcomes"
 *
 * const result = Err("An error occurred");
 * console.error(result.error); // "An error occurred"
 * ```
 *
 * @typeparam T The type of the value.
 * @typeparam E The type of the error.
 */
export interface Failure<T, E>
	extends Matchable<T, E>,
		ErrorFunctor<T, E>,
		Optional<T> {
	/**
	 * The type of the result.
	 */
	type: "error";
	/**
	 * The error of the result.
	 */
	error: E;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it panics with the provided error.
	 *
	 * @example
	 * ```ts
	 * import { Err } from "@walln/outcomes"
	 *
	 * const result = Err("An error occurred");
	 * console.error(result.unwrap()); // "An error occurred"
	 * ```
	 *
	 * @returns The error of the result.
	 */
	unwrap(): T;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it returns the provided default value.
	 *
	 * @example
	 * ```ts
	 * import { Err } from "@walln/outcomes"
	 *
	 * const result = Err("An error occurred");
	 * console.error(result.unwrapOr("A default value")); // "A default value"
	 * ```
	 *
	 * @param defaultValue The default value to return if the value is an Err.
	 * @returns The error of the result or the default value.
	 */
	unwrapOr(defaultValue: T): T;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it returns the result of evaluating the provided default value function.
	 *
	 * @example
	 * ```ts
	 * import { Err } from "@walln/outcomes"
	 *
	 * const result = Err("An error occurred");
	 * console.error(result.unwrapOrElse(() => "A default value")); // "A default value"
	 * ```
	 *
	 * @param fn The function to evaluate if the value is an Err.
	 * @returns The error of the result or the default value.
	 */
	unwrapOrElse(fn: (error: E) => T): T;
	/**
	 * Returns true if the result is a Ok.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok("A successful operation");
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.ok()); // true
	 * console.log(err.ok()); // false
	 * ```
	 *
	 * @returns True if the result is a Ok.
	 */
	ok(this: Result<T, E>): this is Success<T, E>;
	/**
	 * Returns true if the result is a Err.
	 *
	 * @example
	 * ```ts
	 * import { Ok, Err } from "@walln/outcomes"
	 *
	 * const ok = Ok("A successful operation");
	 * const err = Err("An error occurred");
	 *
	 * console.log(ok.err()); // false
	 * console.log(err.err()); // true
	 * ```
	 *
	 * @returns True if the result is a Err.
	 */
	err(this: Result<T, E>): this is Failure<T, E>;
}

/**
 * Represents a value that can be either a value or an error.
 * The state of the result can be checked using the ok and err methods. These methods will narrow the type to either contain a value or an error.
 *
 * @example
 * ```ts
 * import { type Result, Ok, Err } from "@walln/outcomes"
 *
 * function divide(a: number, b: number): Result<number, string> {
 * 	if (b === 0) return Err("Cannot divide by zero");
 * 	return Ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.ok()) console.log(result.value);
 * ```
 * @typeparam T The type of the value.
 * @typeparam E The type of the error.
 */
export type Result<T, E> = Success<T, E> | Failure<T, E>;

/**
 * Create a value implementing the Result interface.
 * The result will contain the value and no error and can be used to represent a successful operation.
 *
 * @example
 * ```ts
 * import { Ok } from "@walln/outcomes"
 *
 * const result = Ok("A successful operation");
 * if (result.ok()) {
 *   console.log(result.value);
 * }
 * ```
 *
 * @param value The value to wrap in a Result.
 * @returns A Result containing the value.
 */
export function Ok<T, E>(value: T): Result<T, E> {
	return {
		type: "value",
		value: value,
		unwrap: () => value,
		unwrapOr: () => value,
		unwrapOrElse: () => value,
		toOption: () => Option(value),
		ok: () => true,
		err: () => false,
		flatMap: (fn) => fn(value),
		flatMapAsync: async (fn) => fn(value),
		match: (handlers) => handlers.Ok(value),
		map: <U>(fn: (value: T) => U): Result<U, E> => {
			try {
				return Ok(fn(value));
			} catch (error) {
				return Err(error as E);
			}
		},
	};
}

/**
 * Create an error implementing the Result interface.
 * The result will contain the error and no value and can be used to represent a known failure.
 *
 * @example
 * ```ts
 * import { Err } from "@walln/outcomes"
 *
 * const result = Err("An error occurred");
 * if (result.err()) {
 *  console.error(result.error);
 * }
 * ```
 *
 * @param error The error to wrap in a Result.
 * @returns A Result containing the error.
 */
export function Err<T, E>(error: E): Result<T, E> {
	return {
		type: "error",
		error: error,
		unwrap: () => {
			throw error;
		},
		unwrapOr: (defaultValue: T) => defaultValue,
		unwrapOrElse: (fn: (error: E) => T) => fn(error),
		toOption: () => None,
		ok: () => false,
		err: () => true,
		flatMap: () => Err(error),
		flatMapAsync: async () => Err(error),
		match: (handlers) => handlers.Err(error),
		map: <U>(_fn: (value: T) => U): Result<T, E> => {
			return Err(error);
		},
	};
}
