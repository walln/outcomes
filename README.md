# Outcomes

Outcomes is a library for using Monadic patterns common in proper functional programming languages. Javascript's exception handling is not up to par for complex applications as exceptions interrupt control flow and are not properly typed.

## Get started

Result types similar to languages like Rust allow you to implement a value that is either an Ok result or an Error without throwing it.

```ts
import { type Result, Ok, Err } from '@walln/outcomes';

function myFunction(value: boolean): Result<boolean, Error> {
    return value ? Ok(value) : Err("Invalid Value");
}

const result = myFunction(true);
result.match({
 Ok: (value) => console.log(value), /// This will be called
 Err: (error) => console.error(error),
});
```

You can also use options for values that may or may not exist. This is not as useful as undefined/nullish values are very commonplace in the JS ecosystem.

```ts
import { type Option, Some, None } from '@walln/outcomes';

function myFunction(value: boolean): Option<boolean> {
    return value ? Some(value) : None;
}

const result = myFunction(true)
console.log(result.unwrap()) /// Logs true
```

Common monad operations like `.map` are implemented as well.
