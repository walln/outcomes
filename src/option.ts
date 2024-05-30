import { Err, Ok, type Result } from "./result";

/**
 * Represents a value or a function that returns a value.
 */
type ValueOrFn<T> = T | (() => T);

/**
 * Gets the value from a function or a value.
 * @param df The value or function to get the value from.
 * @returns The value.
 */
const getFnValue = <T>(df: ValueOrFn<T>) =>
	typeof df === "function" ? (df as () => T)() : df;

/**
 * Functor chaining for Options. Enables chaining of operations on the value regardless of its presence.
 * In the case of a Some value, the function is applied to the value. In the case of a None value, the function is not applied.
 */
interface OptionFunctor<T> {
	/**
	 * Applies a function to the value of the option. If the option is a Some then the function is applied to the value, otherwise it ignores the function.
	 * @param fn The function to apply to the value.
	 */
	flatMap<U>(fn: (value: T) => Option<U>): Option<U>;
	/**
	 * Applies a function to the value of the option. If the option is a Some then the function is applied to the value, otherwise it ignores the function.
	 * @param fn The function to apply to the value.
	 */
	flatMapAsync<U>(fn: (value: T) => Promise<Option<U>>): Promise<Option<U>>;
	/**
	 * Applies a function to the value of the option. If the option is a Some then the function is applied to the value, otherwise it ignores the function and returns the default value.
	 * @param fn The function to apply to the value.
	 * @param defaultValue The value to return if the option is None.
	 */
	mapOr<U>(
		fn: (value: T) => Exclude<U, null | undefined>,
		defaultValue: ValueOrFn<U>,
	): Option<U>;
}

/**
 * Functor chaining for Some values.
 */
interface SomeFunctor<T> extends OptionFunctor<T> {
	/**
	 * Applies a function to the value of the option. If the option is a Some then the function is applied to the value, otherwise it ignores the function.
	 * @param fn The function to apply to the value.
	 */
	map<U>(fn: (value: T) => Exclude<U, null | undefined>): Option<U>;
}

/**
 * Functor chaining for None values.
 */
interface NoneFunctor<T> extends OptionFunctor<T> {
	/**
	 * Applies a function to the value of the option. If the option is a Some then the function is applied to the value, otherwise it ignores the function.
	 * @param fn The function to apply to the value.
	 */
	map<U>(fn: (value: T) => U): Option<U>;
}

/**
 * Represents a value that can be pattern matched.
 * Matches on the existence of a value and performs the handler function.
 */
interface Matchable<T> {
	/**
	 * Matches on the value and performs the handler function.
	 * @param handlers The handler functions to perform.
	 * @returns The value returned by the handler function.
	 */
	match<V>(
		this: Option<T>,
		handlers: { Some: (value: T) => V; None: () => V },
	): V;
}

/**
 * Extracts the value type from an Option.
 */
type FlattenedOption<T> = T extends Option<infer U> ? U : T;

/**
 * Represents a value that is present.
 */
interface SomeType<T> extends Matchable<T>, SomeFunctor<T> {
	type: "some";
	value: T;
	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: () => T): T;
	some(this: Option<T>): this is SomeType<T>;
	none(this: Option<T>): this is NoneType<T>;
	flatten(): Option<FlattenedOption<T>>;
	okOr<E>(this: Option<T>, _err: E): Result<T, E>;
}

/**
 * Represents a value that is absent.
 */
interface NoneType<T> extends Matchable<T>, NoneFunctor<T> {
	type: "none";
	unwrap(): T;
	unwrapOr(defaultValue: T): T;
	unwrapOrElse(fn: () => T): T;
	some(this: Option<T>): this is SomeType<T>;
	none(this: Option<T>): this is NoneType<T>;
	flatten(): Option<FlattenedOption<T>>;
	okOr<E>(this: Option<unknown>, err: E): Result<never, E>;
}

/**
 * Creates a new Some value.
 * @param value The value to wrap.
 * @returns A new Some value.
 */
export function Some<T>(
	value: T extends null | undefined ? never : T,
): Option<T> {
	if (value === null || value === undefined) {
		throw new TypeError("Some value cannot be null or undefined");
	}

	return {
		type: "some",
		value,
		unwrap: () => value,
		unwrapOr: () => value,
		unwrapOrElse: () => value,
		map: (fn) => Some(fn(value)),
		mapOr: (fn, _defaultValue) => Some(fn(value)),
		flatMap: (fn) => fn(value),
		flatMapAsync: async (fn) => fn(value),
		okOr: (_err) => Ok(value),
		some: () => true,
		none: () => false,
		flatten: () => {
			if (isOption(value) && value.some()) {
				return value as SomeType<FlattenedOption<T>>;
			}
			throw new TypeError("Cannot flatten a None value");
		},
		match: (handlers) => handlers.Some(value),
	};
}

/**
 * Represents an absent value.
 * @returns A new None value.
 */
export const None: Option<never> = {
	type: "none",
	unwrap: () => {
		throw new Error("Cannot unwrap None");
	},
	unwrapOr: <T>(defaultValue: T) => defaultValue,
	unwrapOrElse: <T>(fn: () => T) => fn(),
	some: () => false,
	none: () => true,
	map: () => None,
	mapOr(fn, defaultValue) {
		return Option(getFnValue(defaultValue));
	},
	flatMap: (_fn) => None,
	flatMapAsync: async (_fn) => None,
	okOr: (err) => Err(err),
	flatten: () => None,
	match: (handlers) => handlers.None(),
};
Object.freeze(None);

/**
 * Represents an optional value. It is preferred to use the `Some` and `None` instead of this type.
 * This is provided for type checking purposes and compatibility.
 */
export type Option<T> = SomeType<T> | NoneType<T>;

/**
 * Creates a new Option value. It is preferred to use the `Some` and `None` instead of this function.
 * This is provided for type checking purposes and compatibility.
 * @param value The value to wrap.
 * @returns A new Option value.
 */
export function Option<T>(value: T | undefined | null): Option<T> {
	return value === undefined || value === null ? None : Some(value);
}

/**
 * Checks if the value is an Option.
 * @param value The value to check.
 * @returns `true` if the value is an Option, `false` otherwise.
 */
function isOption<T>(value: unknown): value is Option<T> {
	if (value === null || value === undefined) return false;
	return (
		(typeof value === "object" &&
			!!value &&
			"type" in value &&
			(value as Option<T>).type === "some") ||
		(value as Option<T>).type === "none"
	);
}