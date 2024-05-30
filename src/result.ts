import { None, Option } from "./option";

/**
 * Functor chaining for Result. Enables chaining of operations on the value regardless of its status.
 * In the case of a Ok value, the function is applied to the value. In the case of a Err value, the function is not applied.
 */
export interface ResultFunctor<T, E> {
	/**
	 * Applies a function to the value of the result. If the result is an Ok then the function is applied to the value, otherwise it returns the error and ignores the function.
	 * @param fn The function to apply to the value.
	 */
	flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
	/**
	 * Applies a function to the value of the result. If the result is an Ok then the function is applied to the value, otherwise it returns the error and ignores the function.
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
	 * @param fn The function to apply to the value.
	 */
	map<U>(fn: (value: T) => U): Result<U, E>;
}

/**
 * Represents a value that can be converted to an Option.
 */
interface Optional<T> {
	/**
	 * Converts the result into an Option
	 */
	toOption(): Option<T>;
}

/**
 * Represents a value that can be pattern matched.
 * Matches on the existence of a value and performs the handler function.
 */
interface Matchable<T, E> {
	/**
	 * Matches on the value and performs the handler function.
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

interface Success<T, E>
	extends Matchable<T, E>,
		SuccessFunctor<T, E>,
		Optional<T> {
	type: "value";
	/**
	 * The value of the result.
	 */
	value: T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it panics with the provided error.
	 */
	unwrap(): T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it returns the provided default value.
	 * @param defaultValue
	 */
	unwrapOr(defaultValue: T): T;
	/**
	 * Unwraps the result, yielding the content of an Ok. If the value is an Err then it returns the result of evaluating the provided default value function.
	 * @param fn
	 */
	unwrapOrElse(fn: (error: E) => T): T;
	/**
	 * Returns true if the result is a Ok.
	 * @returns True if the result is a Ok.
	 */
	ok(this: Result<T, E>): this is Success<T, E>;
	/**
	 * Returns true if the result is a Err.
	 * @returns True if the result is a Err.
	 */
	err(this: Result<T, E>): this is Failure<T, E>;
}
interface Failure<T, E>
	extends Matchable<T, E>,
		ErrorFunctor<T, E>,
		Optional<T> {
	type: "error";
	/**
	 * The error of the result.
	 */
	error: E;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it panics with the provided error.
	 */
	unwrap(): T;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it returns the provided default value.
	 * @param defaultValue
	 */
	unwrapOr(defaultValue: T): T;
	/**
	 * Unwraps the result, yielding the content of the Result. If the value is an Err then it returns the result of evaluating the provided default value function.
	 * @param fn
	 */
	unwrapOrElse(fn: (error: E) => T): T;
	/**
	 * Returns true if the result is a Ok.
	 * @returns True if the result is a Ok.
	 */
	ok(this: Result<T, E>): this is Success<T, E>;
	/**
	 * Returns true if the result is a Err.
	 * @returns True if the result is a Err.
	 */
	err(this: Result<T, E>): this is Failure<T, E>;
}

export type Result<T, E> = Success<T, E> | Failure<T, E>;

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
