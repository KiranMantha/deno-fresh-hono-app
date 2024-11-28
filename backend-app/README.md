# backend-app

This is a backend app driven by Rust and Hono.

# To Start

1. `cd rust` and run `cargo build --release`
2. `cd deno` and run `deno task start`

Note: 

File Name on Different Platforms:

Linux/macOS: librust.so
Windows: librust.dll
macOS (newer versions): librust.dylib
If you're on Windows or macOS, update the Deno FFI path in main.ts accordingly.