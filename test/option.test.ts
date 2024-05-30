import { test, describe, it, expect } from "vitest";
import { type Option, Some, None } from "../src/index";


describe("Option construction", () => {
    function createOption(value: boolean): Option<boolean> {
        return value ? Some(value) : None;
    }

    it("should return some with a value", () => {
        const option = createOption(true);
        expect(option.some()).toBe(true);
        expect(option.some() && option.value).toBe(true);
    });

    it("should return none with a value", () => {
        const option = createOption(false);
        expect(option.none()).toBe(true);
    });

    it("should throw an error when creating a Some with a null value", () => {
        // @ts-expect-error This is not a valid type
        expect(() => Some(null)).toThrow();
    });
});

describe("Option unwrapping", () => {
    function createOption(value: boolean): Option<boolean> {
        return value ? Some(value) : None;
    }

    it("should unwrap a value", () => {
        const option = Some(42);
        expect(option.unwrap()).toBe(42);
    });

    it("should unwrap a default value", () => {
        const option = createOption(false);
        expect(option.unwrapOr(true)).toBe(true);
    });

    it("should unwrap a default value from a function", () => {
        const option = createOption(false);
        expect(option.unwrapOrElse(() => false)).toBe(false);
    });

    it("should throw an error when unwrapping None", () => {
        const option = None;
        expect(() => option.unwrap()).toThrow();
    });
});

describe("Option mapping", () => {
    it("should map a value", () => {
        const option = Some(42);
        const mapped = option.map((value) => value * 2);
        expect(mapped.unwrap()).toBe(84);
    });

    it("should map a None value", () => {
        const option = None;
        const mapped = option.map((value) => value * 2);
        expect(mapped.none()).toBe(true);
    });

    it("should map a value to a default value", () => {
        const option = Some(42);
        const mapped = option.mapOr((value) => value * 2, 0 as number);
        expect(mapped.unwrap()).toBe(84);
    });

    it("should map a None value to a default value", () => {
        const option = None;
        const mapped = option.mapOr((value) => value * 2, 0 as number);
        expect(mapped.unwrap()).toBe(0);
    });
});

describe("Option flat mapping", () => {
    it("should flat map a value", () => {
        const option = Some(42);
        const mapped = option.flatMap((value) => Some(value * 2));
        expect(mapped.unwrap()).toBe(84);
    });

    it("should flat map a None value", () => {
        const option = None;
        const mapped = option.flatMap((value) => Some(value * 2));
        expect(mapped.none()).toBe(true);
    });
});

describe("Option async flat mapping", () => {
    it("should flat map a value", async () => {
        const option = Some(42);
        const mapped = await option.flatMapAsync(async (value) => Some(value * 2));
        expect(mapped.unwrap()).toBe(84);
    });

    it("should flat map a None value", async () => {
        const option = None;
        const mapped = await option.flatMapAsync(async (value) => Some(value * 2));
        expect(mapped.none()).toBe(true);
    });
});

describe("Option flattening", () => {
    it("should flatten a Some value", () => {
        const option = Some(Some(42));
        const flattened = option.flatten();
        expect(flattened.unwrap()).toBe(42);
    });

    it("should flatten a None value", () => {
        const option = None;
        const flattened = option.flatten();
        expect(flattened).toBe(None);
    });
});

describe("Option matching", () => {
    it("should match a Some value", () => {
        const option = Some(42);
        const value = option.match({
            Some: (value) => value,
            None: () => 0,
        });
        expect(value).toBe(42);
    });

    it("should match a None value", () => {
        const option = None;
        const value = option.match({
            Some: (value) => value,
            None: () => 0,
        });
        expect(value).toBe(0);
    });
});

describe("Result conversion", () => {
    it("should convert a Some value to Ok", () => {
        const option = Some(42);
        const result = option.okOr('error');
        expect(result.type).toBe("value");
    });

    it("should convert a None value to Err", () => {
        const option = None;
        const result = option.okOr(new Error("testing"));
        expect(result.ok()).toBe(false);
        expect(result.err() && result.error).toBeInstanceOf(Error);
    });
});