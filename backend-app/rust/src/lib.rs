use std::ffi::{CString};
use std::os::raw::c_char;
use std::ptr;
use v8;

#[no_mangle]
pub extern "C" fn run_isolate(
    js_code_ptr: *const c_char,
    js_code_len: usize,
    payload_ptr: *const c_char,
    payload_len: usize,
) -> *mut c_char {
    // Convert the raw C string pointers to Rust strings
    let js_code = unsafe {
        assert!(!js_code_ptr.is_null());
        let slice = std::slice::from_raw_parts(js_code_ptr as *const u8, js_code_len);
        match std::str::from_utf8(slice) {
            Ok(s) => s,
            Err(e) => {
                let error_message = format!("Invalid UTF-8 string for js_code: {}", e);
                eprintln!("{}", error_message);
                return CString::new(error_message).unwrap().into_raw();
            }
        }
    };

    let payload = unsafe {
        assert!(!payload_ptr.is_null());
        let slice = std::slice::from_raw_parts(payload_ptr as *const u8, payload_len);
        match std::str::from_utf8(slice) {
            Ok(s) => s,
            Err(e) => {
                let error_message = format!("Invalid UTF-8 string for payload: {}", e);
                eprintln!("{}", error_message);
                return CString::new(error_message).unwrap().into_raw();
            }
        }
    };

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
        let global_obj = context.global(scope);
        let result = match handler_fn.call(scope, global_obj.into(), args) {
            Some(r) => r,
            None => {
                let error_message = v8::String::new(scope, "Error calling handler function").unwrap();
                // return error_message.into_raw();
                let error_message_str = error_message.to_rust_string_lossy(scope);  // Convert v8::String to Rust String
                let c_string = CString::new(error_message_str).unwrap();            // Convert to CString
                return c_string.into_raw();   
            }
        };
    
        // Handling promises
        let final_result = if result.is_promise() {
            let promise = v8::Local::<v8::Promise>::try_from(result).unwrap();
            match promise.state() {
                v8::PromiseState::Fulfilled => {
                    promise.result(scope)
                }
                v8::PromiseState::Rejected => {
                    v8::String::new(scope, "Promise rejected").unwrap().into()
                }
                _ => {
                    v8::String::new(scope, "Promise unresolved").unwrap().into()
                }
            }
        } else {
            result
        };
    
        // Convert the final_result (V8 value) to a Rust string
        let json = v8::json::stringify(scope, final_result.into()).unwrap();
        let result_str = json.to_string(scope).unwrap().to_rust_string_lossy(scope);
        println!("final result in rust: {}", result_str);
    
        // Return the result as a pointer to a C string
        let c_string = CString::new(result_str).unwrap();
        c_string.into_raw()
    }; // End of V8 scope
    
    // Explicitly drop the isolate to ensure it is destroyed.
    drop(isolate);

    // Return the result pointer.
    return result_ptr;
}
