import { test, describe, it, expect } from "vitest";
import { type Result, Ok, Err } from "../src/index";

describe("Result construction", () => {
	function createResult(value: boolean): Result<boolean, Error> {
		return value ? Ok(value) : Err(new Error("testing"));
	}

	it("should return ok with a value", () => {
		const result = createResult(true);
		expect(result.ok()).toBe(true);
		expect(result.ok() && result.value).toBe(true);
	});

	it("should return error with an error", () => {
		const result = createResult(false);
		expect(result.ok()).toBe(false);
		expect(result.err() && result.error).toBeInstanceOf(Error);
	});
});

describe("Result unwrapping", () => {
	it("should unwrap a value", () => {
		const result = Ok(42);
		expect(result.unwrap()).toBe(42);
	});

	it("should unwrap a default value", () => {
		const result = Err(new Error("testing"));
		expect(result.unwrapOr(42)).toBe(42);
	});

	it("should unwrap a default value from a function", () => {
		const result = Err(new Error("testing"));
		expect(result.unwrapOrElse(() => 42)).toBe(42);
	});

	it("should throw an error when unwrapping an error", () => {
		const result = Err(new Error("testing"));
		expect(() => result.unwrap()).toThrow();
	});
});

describe("Result matching", () => {
	it("should match a value", () => {
		const result = Ok(42);
		const value = result.match({
			Ok: (value) => value,
			Err: (error) => error,
		});
		expect(value).toBe(42);
	});

	it("should match an error", () => {
		const result = Err(new Error("testing"));
		const error = result.match({
			Ok: (value) => value,
			Err: (error) => error,
		});
		expect(error).toBeInstanceOf(Error);
	});
});

describe("Result mapping", () => {
	it("should map a value", () => {
		const result = Ok(42);
		const mapped = result.map((value) => value * 2);
		expect(mapped.ok()).toBe(true);
		expect(mapped.ok() && mapped.value).toBe(84);
	});

	it("should map an error", () => {
		const result = Err(new Error("testing"));
		const mapped = result.map((value) => value);
		expect(mapped.ok()).toBe(false);
		expect(mapped.err() && mapped.error).toBeInstanceOf(Error);
	});
});

describe("Result flat mapping", () => {
	it("should flat map a value", () => {
		const result = Ok(42);
		const mapped = result.flatMap((value) => Ok(value * 2));
		expect(mapped.ok()).toBe(true);
		expect(mapped.ok() && mapped.value).toBe(84);
	});

	it("should flat map an error", () => {
		const result = Err(new Error("testing"));
		const mapped = result.flatMap((value) => Ok(value));
		expect(mapped.ok()).toBe(false);
		expect(mapped.err() && mapped.error).toBeInstanceOf(Error);
	});
});

describe("Result async flat mapping", () => {
	it("should flat map a value", async () => {
		const result = Ok(42);
		const mapped = await result.flatMapAsync(async (value) => Ok(value * 2));
		expect(mapped.ok()).toBe(true);
		expect(mapped.ok() && mapped.value).toBe(84);
	});

	it("should flat map an error", async () => {
		const result = Err(new Error("testing"));
		const mapped = await result.flatMapAsync(async (value) => Ok(value));
		expect(mapped.ok()).toBe(false);
		expect(mapped.err() && mapped.error).toBeInstanceOf(Error);
	});
});
