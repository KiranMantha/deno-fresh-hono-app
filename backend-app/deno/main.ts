import { Hono } from "hono";

const app = new Hono();

// Load the Rust compiled library
const rustLib = Deno.dlopen("../rust/target/release/librust.dylib", {
  run_isolate: {
    parameters: ["buffer", "i32", "buffer", "i32"],
    result: "pointer",
  },
});

// Sample endpoint: Accept operation and payload
app.get("/api/:operation/:name", async (c) => {
  const operation = c.req.param("operation");
  const name = c.req.param("name");
//   const payload = await c.req.json(); // Assuming JSON payload
  const payloadStr = JSON.stringify({name});

  // Load corresponding JS code dynamically
  const jsCode = await Deno.readTextFile(`./isolates/${operation}.js`);

  // Call Rust isolate function
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
  return c.json({ result: JSON.parse(result) });
});

const port = 3000;

// Start the server
Deno.serve({ port }, app.fetch);
