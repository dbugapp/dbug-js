function safeStringify(payload: unknown): string {
  try {
    if (!payload) throw new Error("No payload to serialize");
    return JSON.stringify(
      payload,
      (key, value) => {
        if (value && value.__v_isRef) {
          return { [`Vue.Ref`]: value.value };
        }
        return value;
      },
      2,
    );
  } catch (error) {
    return JSON.stringify({
      error: "Serialization failed",
      reason: String(error),
    });
  }
}

export async function dbug(payload: unknown) {
  try {
    const response = await fetch("http://127.0.0.1:53821/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: safeStringify(payload),
      // Use AbortController to set a short timeout
      signal: AbortSignal.timeout(500),
    });
    console.log("response", response);
  } catch (error) {
    console.error("dbug error", error);
  }
}
