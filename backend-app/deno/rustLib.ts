const rustLib = Deno.dlopen("../rust/target/release/librust.dylib", {
  run_isolate: {
    parameters: ["buffer", "i32", "buffer", "i32"],
    result: "pointer",
  },
});

export { rustLib };
