export function stringify(payload: unknown): string {
  if (!payload) {
    return JSON.stringify(
      {
        error: "Serialization failed",
        reason: "Error: [dbug] no payload to serialize",
      },
      undefined,
      2,
    );
  }

  const cache = new Set();
  try {
    return JSON.stringify(
      payload,
      (key, value) => {
        // Handle custom types first
        if (value && value.__v_isRef) {
          return { [`Vue.Ref`]: value.value };
        }
        if (typeof value === "function") {
          return {
            function: value.name || "anonymous",
            code: value.toString().split("\n"),
          };
        }

        // Handle circular references
        if (typeof value === "object" && value !== null) {
          if (cache.has(value)) {
            // Circular reference found, discard key
            return "[circular]";
          }
          // Store value in our collection
          cache.add(value);
        }
        return value;
      },
      2,
    );
  } catch (error) {
    // Catch errors not related to circular refs (e.g., BigInt serialization)
    return JSON.stringify(
      {
        error: "Serialization failed",
        reason: String(error),
      },
      undefined,
      2,
    );
  }
}

export async function dbug(payload: unknown) {
  try {
    await fetch("http://127.0.0.1:53821/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: stringify(payload),
      signal: AbortSignal.timeout(500),
    });
  } catch (error) {
    if (
      // Check for common connection error messages
      (error instanceof TypeError &&
        (String(error).includes("fetch") ||
          String(error).includes("connect"))) ||
      // Also check for timeout errors
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      console.error(
        `[dbug] Failed to connect or timed out. Is the dbug desktop app running? Download: http://github.com/dbugapp\nOriginal error: ${error}`,
      );
    } else {
      // Log other unexpected errors
      console.error(`[dbug] An unexpected error occurred:`, error);
    }
  }
}
