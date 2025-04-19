function stringify(payload: unknown): string {
  try {
    if (!payload) throw new Error("[dbug] no payload to serialize");
    return JSON.stringify(
      payload,
      (key, value) => {
        if (value && value.__v_isRef) {
          return { [`Vue.Ref`]: value.value };
        }
        if (typeof value === "function") {
          return {
            function: value.name || "anonymous",
            code: value.toString().split("\n"),
          };
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
      body: stringify(payload),
      signal: AbortSignal.timeout(500),
    });
    console.log("response", response);
  } catch (error) {
    console.error("[dbug] error", error);
  }
}
