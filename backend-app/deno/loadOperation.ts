// operationLoader.ts
export async function loadOperation(operationName: string) {
    try {
      const module = await import(`./isolates/${operationName}.ts`);
      return module.default;
    } catch (error) {
      throw new Error(`Operation '${operationName}' not found or failed to load. ${error}`);
    }
  }
  