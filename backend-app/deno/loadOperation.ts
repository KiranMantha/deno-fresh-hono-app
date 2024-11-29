// operationLoader.ts
export async function loadOperation(operationName: string) {
  const module = await import(`./isolates/${operationName}.ts`);
  return module.default;
}
