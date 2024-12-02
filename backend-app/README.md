# backend-app

This is a backend app driven by Rust and Hono.

# To Start

1. `cd rust` and run `cargo build --release`
2. `cd deno` and run `deno task start`

Note: 

File Name on Different Platforms:

- Linux/macOS: librust.so
- Windows: librust.dll
- macOS (newer versions): librust.dylib
If you're on Windows or macOS, update the Deno FFI path in main.ts accordingly.

# Example apis:

1. GET http://localhost:3000/api/sample?name=testU
2. GET http://localhost:3000/api/test
3. curl -X POST http://localhost:3000/api/sample \
     -H "Content-Type: application/json" \
     -d '{"name": "Deno User"}'

## To add / remove packages:

### in Deno

1. `deno add <package-name>` / `deno remove <package-name>`
2. to install all packages: `deno install`

### in Rust

1. `cargo add <package-name>` / `cargo remove <package-name>`
