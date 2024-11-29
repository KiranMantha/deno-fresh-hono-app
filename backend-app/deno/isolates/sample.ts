export default function handler(payload: Record<string, unknown>) {
  return {
    message: `Hello from isolate! Received data: ${payload["name"]}`,
  };
}
