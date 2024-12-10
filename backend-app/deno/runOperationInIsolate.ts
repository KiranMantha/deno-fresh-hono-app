import { loadOperation } from "./loadOperation.ts";
import { rustLib } from "./rustLib.ts";

export async function runOperationInIsolate(
  operationName: string,
  payload: Record<string, unknown>
) {
  let result = "";
  try {
    const handlerCode = await loadOperation(operationName);
    const payloadStr = JSON.stringify(payload);
    const resultPointer = rustLib.symbols.run_isolate(
      new TextEncoder().encode(handlerCode),
      handlerCode.length,
      new TextEncoder().encode(payloadStr),
      payloadStr.length
    );

    // Here we check if the resultPointer is not null, meaning that the function returned a valid pointer
    if (resultPointer === null) {
      throw new Error("Rust isolate function failed to return a valid result");
    }
    // Now, we can assume the pointer points to a valid memory block
    const resultMemory = new Deno.UnsafePointerView(resultPointer);
    let offset = 0;
    while (true) {
      const byte = resultMemory.getUint8(offset++);
      if (byte === 0) break; // Stop at null terminator
      result += String.fromCharCode(byte);
    }
    console.log("result in deno", result);
  } catch (error) {
    result = '{"error":"Requested operation not found"}';
    console.error("Error executing operation in isolate:", error);
  }
  return result;
}
