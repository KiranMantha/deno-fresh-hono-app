console.log("Script is running.");

globalThis.handler = function (payload) {
  const parsedPayload = JSON.parse(payload);
  return {
    message: `Hello from isolate! Received data: ${parsedPayload["name"]}`,
  };
};
