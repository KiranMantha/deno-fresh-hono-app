import { loadOperation } from "./loadOperation.ts";
import { rustLib } from "./rustLib.ts"; // Assume this is set up for FFI

export async function runOperationInIsolate(operationName: string, payload: Record<string, unknown>) {
  try {
    const handlerFn = await loadOperation(operationName);
    //TODO: add async await support
    const jsCode = `
        globalThis.handler = function (payload) {
            const parsedPayload = JSON.parse(payload);
            return (${handlerFn.toString()})(parsedPayload);
        };
    `;
    console.log('JS logic', jsCode);
    const payloadStr = JSON.stringify(payload);
    const resultPointer = rustLib.symbols.run_isolate(
      new TextEncoder().encode(jsCode),
      jsCode.length,
      new TextEncoder().encode(payloadStr),
      payloadStr.length
    );

    // Here we check if the resultPointer is not null, meaning that the function returned a valid pointer
    if (resultPointer === null) {
      throw new Error("Rust isolate function failed to return a valid result");
    }
    // Now, we can assume the pointer points to a valid memory block
    const resultMemory = new Deno.UnsafePointerView(resultPointer);
    let result = "";
    let offset = 0;
    while (true) {
      const byte = resultMemory.getUint8(offset++);
      if (byte === 0) break; // Stop at null terminator
      result += String.fromCharCode(byte);
    }
    console.log("result in deno", result);
    return result;
  } catch (error) {
    console.error("Error executing operation in isolate:", error);
  }
  return '{}';
}
