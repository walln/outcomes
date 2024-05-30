export interface ResultFunctor<T, E> {
	flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E>;
	flatMapAsync<U>(
		fn: (value: T) => Promise<Result<U, E>>,
	): Promise<Result<U, E>>;
}

export interface ErrorFunctor<T, E> extends ResultFunctor<T, E> {
	map<U>(fn: (value: T) => U): Result<T, E>;
}

export interface SuccessFunctor<T, E> extends ResultFunctor<T, E> {
	map<U>(fn: (value: T) => U): Result<U, E>;
}

// interface Optional<T> {
// 	// toOption(): Option<T>;
// }

interface Matchable<T, E> {
	match<R>(
		this: Result<T, E>,
		handlers: {
			Ok: (value: T) => R;
			Err: (error: E) => R;
		},
	): R;
}

interface Success<T, E> extends Matchable<T, E>, SuccessFunctor<T, E> {
	type: "value";
	value: T;
	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: (error: E) => T): T;
	//toOption(): Option<T>;
	ok(this: Result<T, E>): this is Success<T, E>;
	err(this: Result<T, E>): this is Failure<T, E>;
}
interface Failure<T, E> extends Matchable<T, E>, ErrorFunctor<T, E> {
	type: "error";
	error: E;
	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: (error: E) => T): T;
	//toOption(): Option<T>;
	ok(this: Result<T, E>): this is Success<T, E>;
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
