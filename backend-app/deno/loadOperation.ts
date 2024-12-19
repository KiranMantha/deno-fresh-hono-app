export function loadOperation(operationCode: string) {
  // replace export statements like `export { r as default } with return await r(parsedPayload)`
  const cleanedCode = operationCode.replace(/export\s*\{\s*([^}]+)\s+as\s+default\s*\}\s*;?/g, (_, funcName) => {
    // Replace the export with the function call (r(payload))
    return `;return await ${funcName}(parsedPayload);`;
  });

  // Wrap the remaining code inside `globalThis.handler` function
  const handlerCode = `
    globalThis.handler = async function (payload) {
        const parsedPayload = JSON.parse(payload);
        ${cleanedCode}
    };
`;

  // Log the cleaned code for debugging
  console.log(handlerCode);
  return handlerCode;
}
