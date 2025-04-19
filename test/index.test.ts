import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from "vitest";
import { stringify, dbug } from "../src";

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

  it("should handle circular references gracefully", () => {
    const obj: any = { a: 1 };
    obj.circular = obj;
    const expectedJson = JSON.stringify(
      {
        a: 1,
        circular: "[circular]",
      },
      undefined,
      2,
    );
    // We expect the stringified output, not JSON.parse
    expect(stringify(obj)).toBe(expectedJson);
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

describe("dbug", () => {
  let fetchSpy: MockInstance;
  let consoleErrorSpy: MockInstance;
  let abortSpy: MockInstance;

  beforeEach(() => {
    // Mock global fetch
    fetchSpy = vi.spyOn(globalThis, "fetch");
    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // Mock AbortSignal.timeout
    abortSpy = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(undefined as any); // Use undefined
  });

  afterEach(() => {
    // Restore mocks
    vi.restoreAllMocks();
  });

  it("should call fetch with correct parameters on success", async () => {
    const payload = { message: "hello world" };
    fetchSpy.mockResolvedValueOnce(new Response(undefined, { status: 200 })); // Use undefined for body

    await dbug(payload);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith("http://127.0.0.1:53821/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: stringify(payload),
      signal: undefined, // We mocked timeout to return undefined
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(abortSpy).toHaveBeenCalledWith(500);
  });

  it("should log connection error message if fetch fails with TypeError", async () => {
    const payload = { data: 123 };
    const fetchError = new TypeError("Failed to fetch");
    fetchSpy.mockRejectedValueOnce(fetchError);

    await dbug(payload);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[dbug] Failed to connect or timed out. Is the dbug desktop app running? Download: http://github.com/dbugapp\nOriginal error: ${fetchError}`,
    );
  });

  it("should log connection error message if fetch fails with AbortError", async () => {
    const payload = { status: "timeout" };
    const abortError = new DOMException(
      "The operation was aborted.",
      "AbortError",
    );
    fetchSpy.mockRejectedValueOnce(abortError);

    await dbug(payload);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[dbug] Failed to connect or timed out. Is the dbug desktop app running? Download: http://github.com/dbugapp\nOriginal error: ${abortError}`,
    );
  });

  it("should log unexpected error message for other fetch errors", async () => {
    const payload = { anything: true };
    const otherError = new Error("Something else went wrong");
    fetchSpy.mockRejectedValueOnce(otherError);

    await dbug(payload);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `[dbug] An unexpected error occurred:`,
      otherError,
    );
  });
});
