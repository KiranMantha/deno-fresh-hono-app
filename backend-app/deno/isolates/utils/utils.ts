export const displayGreeting = (payload: Record<string, unknown>) => {
  return {
    message: `Hello from isolate! Received data: ${payload["name"]}`,
  };
};
