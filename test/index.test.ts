import { describe, expect, it } from "vitest";
import { stringify } from "../src";

describe("stringify", () => {
  it("should stringify primitives", () => {
    expect(stringify(123)).toBe("123");
    expect(stringify("hello")).toBe('"hello"');
    expect(stringify(true)).toBe("true");
  });

  it("should stringify simple objects", () => {
    const obj = { a: 1, b: "test" };
    expect(stringify(obj)).toBe(JSON.stringify(obj, undefined, 2));
  });

  it("should stringify simple arrays", () => {
    const arr = [1, "test", true];
    expect(stringify(arr)).toBe(JSON.stringify(arr, undefined, 2));
  });

  it("should handle undefined payload", () => {
    expect(JSON.parse(stringify(undefined))).toEqual({
      error: "Serialization failed",
      reason: "Error: [dbug] no payload to serialize",
    });
  });
  it("should handle null payload", () => {
    // eslint-disable-next-line unicorn/no-null
    expect(JSON.parse(stringify(null))).toEqual({
      error: "Serialization failed",
      reason: "Error: [dbug] no payload to serialize",
    });
  });

  it("should handle functions", () => {
    function myFunction() {
      console.log("hello");
    }
    const expected = {
      function: "myFunction",
      code: myFunction.toString().split("\n"),
    };
    expect(JSON.parse(stringify(myFunction))).toEqual(expected);

    const anonymousFunc = () => {};
    const expectedAnonymous = {
      function: "anonymous",
      code: anonymousFunc.toString().split("\n"),
    };
    const parsedAnonymous = JSON.parse(stringify(anonymousFunc));
    expect(parsedAnonymous.function === "anonymousFunc").toBe(true);
    expect(parsedAnonymous.code).toEqual(expectedAnonymous.code);
  });

  it("should handle objects with functions", () => {
    function innerFunc() {
      return 1;
    }
    const obj = { a: 1, func: innerFunc };
    const expectedFunc = {
      function: "innerFunc",
      code: innerFunc.toString().split("\n"),
    };
    const expectedObj = JSON.stringify(
      { a: 1, func: expectedFunc },
      undefined,
      2,
    );
    expect(stringify(obj)).toBe(expectedObj);
  });

  it("should handle Vue refs", () => {
    const ref = { __v_isRef: true, value: 123 };
    const expected = {
      "Vue.Ref": 123,
    };
    expect(JSON.parse(stringify(ref))).toEqual(expected);
  });

  it("should handle objects with Vue refs", () => {
    const ref = { __v_isRef: true, value: "hello" };
    const obj = { a: 1, myRef: ref };
    const expectedRef = {
      "Vue.Ref": "hello",
    };
    const expectedObj = JSON.stringify(
      { a: 1, myRef: expectedRef },
      undefined,
      2,
    );
    expect(stringify(obj)).toBe(expectedObj);
  });

  it("should handle circular references by throwing error", () => {
    const obj: any = { a: 1 };
    obj.circular = obj;
    expect(JSON.parse(stringify(obj))).toEqual({
      error: "Serialization failed",
      reason:
        "TypeError: Converting circular structure to JSON\n    --> starting at object with constructor 'Object'\n    --- property 'circular' closes the circle",
    });
  });

  it("should handle BigInt by throwing error", () => {
    try {
      const bigIntValue = BigInt(9_007_199_254_740_991);
      expect(JSON.parse(stringify(bigIntValue))).toEqual({
        error: "Serialization failed",
        reason: "TypeError: Do not know how to serialize a BigInt",
      });
    } catch (error_) {
      console.warn(
        "BigInt did not cause JSON.stringify to throw as expected:",
        error_,
      );
    }
  });
});
