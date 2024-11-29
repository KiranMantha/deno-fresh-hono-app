use std::ffi::CString;
use std::ptr;
use v8;

#[no_mangle]
pub extern "C" fn run_isolate(js_code: &str, payload: &str) -> *mut i8 {
    // Initialize the V8 runtime. This should be done once globally.
    static INIT: std::sync::Once = std::sync::Once::new();
    INIT.call_once(|| {
        let platform = v8::new_default_platform(0, false).make_shared();
        v8::V8::initialize_platform(platform);
        v8::V8::initialize();
    });

    // Create a new isolate for each call to ensure no global state issues.
    let mut isolate = v8::Isolate::new(v8::CreateParams::default());
    let result_ptr = {
        let handle_scope = &mut v8::HandleScope::new(&mut isolate);
        let context_options = v8::ContextOptions::default();
        let context = v8::Context::new(handle_scope, context_options);
        let scope = &mut v8::ContextScope::new(handle_scope, context);

        // Compile the JavaScript code.
        let code = v8::String::new(scope, js_code).unwrap();
        let script = match v8::Script::compile(scope, code, None) {
            Some(s) => s,
            None => {
                eprintln!("Error: JavaScript code failed to compile");
                return ptr::null_mut();
            }
        };
        script.run(scope).unwrap();

        // Now get the `handler` function from the global object.
        let handler_key = v8::String::new(scope, "handler").unwrap();
        let handler_obj = context
            .global(scope)
            .get(scope, handler_key.into())
            .unwrap();
        let handler_fn = v8::Local::<v8::Function>::try_from(handler_obj).unwrap();

        // Convert the payload into a V8 string to pass as an argument
        let v8_payload = v8::String::new(scope, payload).unwrap();

        // Call the `handler` function with the payload argument
        let args = &mut [v8_payload.into()];
        let result = handler_fn.call(scope, handler_obj, args).unwrap();

        if result.is_promise() {
            let promise = v8::Local::<v8::Promise>::try_from(result).unwrap();
            let state = promise.state();

            match state {
                v8::PromiseState::Fulfilled => {
                    let fulfilled_result = promise.result(scope);
                    // Convert fulfilled result to string
                    let json = v8::json::stringify(scope, fulfilled_result).unwrap();
                    let result_str = json.to_string(scope).unwrap().to_rust_string_lossy(scope);
                    println!("final result in rust: {}", result_str);

                    // Return the result as a pointer.
                    let c_string = CString::new(result_str).unwrap();
                    c_string.into_raw()
                }
                v8::PromiseState::Rejected => {
                    eprintln!("Promise rejected");
                    ptr::null_mut()
                }
                _ => {
                    // Wait logic for unresolved promises
                    ptr::null_mut()
                }
            }
        } else {
            // Convert the result back into a Rust string.
            let json = v8::json::stringify(scope, result.into()).unwrap();
            let result_str = json.to_string(scope).unwrap().to_rust_string_lossy(scope);
            println!("final result in rust: {}", result_str);

            // Return the result as a pointer.
            let c_string = CString::new(result_str).unwrap();
            c_string.into_raw()
        }
    }; // End of the scope for handle_scope and context

    // Explicitly drop the isolate to ensure it is destroyed.
    drop(isolate);

    // Return the result pointer.
    result_ptr
}
